import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../service/profileService";
import { storageService } from "../../service/storageService";
import { useTranslation } from "../../hooks/useTranslation";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { ShareButton } from "../../components/ShareButton";
import { useAuthStore } from "../../store/useAuthStore";

const splitFullName = (fullName = "") => {
  const normalizedName = fullName.trim().replace(/\s+/g, " ");
  if (!normalizedName) return { firstName: "", lastName: "" };

  const [firstName, ...lastNameParts] = normalizedName.split(" ");
  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
};

const joinFullName = (firstName = "", lastName = "") =>
  [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

const scrollToTop = () => {
  requestAnimationFrame(() => {
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const normalizeList = (items) =>
  [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const ChipInput = ({ label, value, onChange, placeholder, addLabel, className }) => {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
    if (!inputValue.trim()) return;
    const nextItems = normalizeList([...value, inputValue]);
    onChange(nextItems);
    setInputValue("");
  };

  const removeItem = (itemToRemove) => {
    onChange(value.filter((item) => item !== itemToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className={`flex flex-col space-y-1.5 ${className || "w-full"}`}>
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="w-full min-h-[46px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          {value.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-100 dark:border-purple-500/20 px-3 py-1 text-sm font-semibold">
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-purple-500 hover:text-purple-800 dark:hover:text-purple-200 font-bold ml-1"
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length ? "" : placeholder}
            className="min-w-[160px] flex-1 bg-transparent py-1 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={addItem}
            disabled={!inputValue.trim()}
            className="rounded-full px-3 py-1 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 cursor-pointer"
          >
            {addLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const createProfileFormData = (profile = {}) => {
  const thaiName = splitFullName(profile.full_name_th || "");
  const englishName = splitFullName(profile.full_name_en || "");

  const parseTitleList = (titleField) => {
    if (!titleField) return [];
    const val = String(titleField).trim();
    if (val.startsWith("[")) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return val.split(",").map(s => s.trim()).filter(Boolean);
  };

  return {
    username: profile.username || "",
    first_name_th: profile.first_name_th || thaiName.firstName,
    last_name_th: profile.last_name_th || thaiName.lastName,
    first_name_en: profile.first_name_en || englishName.firstName,
    last_name_en: profile.last_name_en || englishName.lastName,
    title_th: parseTitleList(profile.title_th || ""),
    title_en: parseTitleList(profile.title_en || ""),
    bio_th: profile.bio_th || "",
    bio_en: profile.bio_en || "",
    email: profile.email || "",
    phone: profile.phone || "",
    location_th: profile.location_th || "",
    location_en: profile.location_en || "",
    is_available: profile.is_available ?? true,
  };
};

const ProfileEditor = () => {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const { t, lang } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [formTab, setFormTab] = useState("en");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize with empty data
  const [formData, setFormData] = useState({
    username: "",
    first_name_th: "", last_name_th: "",
    first_name_en: "", last_name_en: "",
    title_th: [], title_en: [],
    bio_th: "", bio_en: "",
    email: "", phone: "",
    location_th: "", location_en: "",
    is_available: true,
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [cvUrl, setCvUrl] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const profile = await profileService.getProfileById(user.id);
        
        // Only populate from server if there's no draft
        const draft = sessionStorage.getItem("profile_draft_v2");
        if (draft) {
          setFormData(createProfileFormData(JSON.parse(draft)));
          setIsDirty(true);
        } else {
          setFormData(createProfileFormData(profile));
        }
        setAvatarPreview(profile.avatar_url || "");
        setCvUrl(profile.cv_url || "");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    }
    loadProfile();
  }, [user]);

  // Save draft whenever formData changes, but only after initial load and if dirty
  useEffect(() => {
    if (isLoaded && isDirty) {
      sessionStorage.setItem("profile_draft_v2", JSON.stringify(formData));
    }
  }, [formData, isLoaded, isDirty]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsDirty(true);
    }
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setMessage({ type: "error", text: lang === "th" ? "กรุณาอัปโหลดไฟล์ PDF เท่านั้น" : "Please upload a PDF file only." });
        return;
      }
      setCvFile(file);
      setIsDirty(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Validate username
      const isAvailable = await profileService.checkUsernameAvailable(formData.username, user.id);
      if (!isAvailable) {
        setMessage({ type: "error", text: "Username is already taken." });
        scrollToTop();
        setSaving(false);
        return;
      }

      let avatar_url = avatarPreview;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;
        await storageService.uploadFile("avatars", filePath, avatarFile);
        avatar_url = storageService.getPublicUrl("avatars", filePath);
      }

      let uploaded_cv_url = cvUrl;
      if (cvFile) {
        const fileExt = cvFile.name.split('.').pop();
        const filePath = `${user.id}/cv.${fileExt}`;
        await storageService.uploadFile("cvs", filePath, cvFile);
        uploaded_cv_url = storageService.getPublicUrl("cvs", filePath);
        setCvUrl(uploaded_cv_url);
        setCvFile(null); // Clear CV file upload state after successful upload
      }

      const profilePayload = {
        username: formData.username,
        full_name_th: joinFullName(formData.first_name_th, formData.last_name_th),
        full_name_en: joinFullName(formData.first_name_en, formData.last_name_en),
        title_th: JSON.stringify(formData.title_th),
        title_en: JSON.stringify(formData.title_en),
        bio_th: formData.bio_th,
        bio_en: formData.bio_en,
        email: formData.email,
        phone: formData.phone,
        location_th: formData.location_th,
        location_en: formData.location_en,
        is_available: formData.is_available,
      };

      await profileService.updateProfile(user.id, {
        ...profilePayload,
        avatar_url,
        cv_url: uploaded_cv_url,
      });

      sessionStorage.removeItem("profile_draft_v2");
      setIsDirty(false);
      setMessage({ type: "success", text: lang === "th" ? "บันทึกโปรไฟล์เรียบร้อยแล้ว!" : "Profile saved successfully!" });
      scrollToTop();
      
      setTimeout(() => setMessage(null), 3000);
      
      // Update user metadata for navigation link
      if(user && user.user_metadata) {
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            username: formData.username,
          },
        });
      }
      
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Error saving profile." });
      scrollToTop();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Card className="animate-fade-in-up p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.editProfile")}</h2>
        {formData.username && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button className="w-full sm:w-auto" variant="secondary" size="sm" onClick={() => window.open(`/portfolio/${formData.username}`, '_blank')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {lang === "th" ? "ดูหน้าพอร์ต" : "View Portfolio"}
            </Button>
            <ShareButton username={formData.username} />
          </div>
        )}
      </div>
      {message && (
        <div className={`fixed left-4 right-4 top-20 z-50 p-4 rounded-xl shadow-lg border animate-fade-in-up sm:left-auto sm:right-6 sm:top-24 sm:max-w-md ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-gray-800 dark:border-green-900/50 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-gray-800 dark:border-red-900/50 dark:text-red-400'}`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ) : (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
            <span className="font-medium">{message.text}</span>
            <button type="button" onClick={() => setMessage(null)} className="ml-4 opacity-70 hover:opacity-100">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </div>
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{lang === "th" ? "รูปโปรไฟล์" : "Profile Picture"}</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full max-w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400 cursor-pointer" />
          </div>
        </div>

        {/* CV PDF Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-150 dark:border-gray-800">
          <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {lang === "th" ? "อัปโหลด Resume / CV (ไฟล์ PDF)" : "Upload Resume / CV (PDF File)"}
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleCvChange} 
                className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400 cursor-pointer" 
              />
              {cvFile && (
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {cvFile.name}
                </span>
              )}
              {cvUrl && !cvFile && (
                <a 
                  href={cvUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs font-semibold text-purple-600 dark:text-purple-450 hover:underline inline-flex items-center gap-1 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-2xs transition-colors hover:bg-gray-50"
                >
                  {lang === "th" ? "ดูไฟล์ CV ปัจจุบัน" : "View current CV"}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6">
          <Input className="md:col-span-3" label={lang === "th" ? "ชื่อผู้ใช้ (URL Slug)" : "Username (URL Slug)"} name="username" value={formData.username} onChange={handleChange} required />
          <Input className="md:col-span-3" label={lang === "th" ? "อีเมล" : "Email"} type="email" name="email" value={formData.email} onChange={handleChange} />
          <Input className="md:col-span-3" label={lang === "th" ? "เบอร์โทรศัพท์" : "Phone"} name="phone" value={formData.phone} onChange={handleChange} />
          
          <div className="flex items-center gap-3 py-2 md:col-span-3 md:mt-8">
            <input 
              type="checkbox" 
              id="is_available" 
              name="is_available" 
              checked={formData.is_available} 
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === "th" ? "พร้อมรับงาน (แสดงป้าย 'พร้อมรับงาน' บนโปรไฟล์)" : "Available for hire (Shows 'Available' badge on profile)"}
            </label>
          </div>

          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 md:col-span-6">
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("en")}>{lang === "th" ? "ภาษาอังกฤษ" : "English"}</button>
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("th")}>{lang === "th" ? "ภาษาไทย" : "Thai"}</button>
          </div>
          
          {formTab === "en" ? (
            <>
              <Input className="md:col-span-3" label={lang === "th" ? "ชื่อ (EN)" : "First Name (EN)"} name="first_name_en" value={formData.first_name_en} onChange={handleChange} required />
              <Input className="md:col-span-3" label={lang === "th" ? "นามสกุล (EN)" : "Last Name (EN)"} name="last_name_en" value={formData.last_name_en} onChange={handleChange} required />
              <ChipInput
                className="md:col-span-3"
                label={lang === "th" ? "ตำแหน่งงาน (EN)" : "Job Title (EN)"}
                value={formData.title_en}
                onChange={(nextList) => {
                  setFormData(prev => ({ ...prev, title_en: nextList }));
                  setIsDirty(true);
                }}
                placeholder="e.g. System Engineer"
                addLabel={lang === "th" ? "เพิ่ม" : "Add"}
              />
              <Input className="md:col-span-3" label={lang === "th" ? "สถานที่อยู่ (EN)" : "Location (EN)"} name="location_en" value={formData.location_en} onChange={handleChange} />
            </>
          ) : (
            <>
              <Input className="md:col-span-3" label={lang === "th" ? "ชื่อ (TH)" : "First Name (TH)"} name="first_name_th" value={formData.first_name_th} onChange={handleChange} />
              <Input className="md:col-span-3" label={lang === "th" ? "นามสกุล (TH)" : "Last Name (TH)"} name="last_name_th" value={formData.last_name_th} onChange={handleChange} />
              <ChipInput
                className="md:col-span-3"
                label={lang === "th" ? "ตำแหน่งงาน (TH)" : "Job Title (TH)"}
                value={formData.title_th}
                onChange={(nextList) => {
                  setFormData(prev => ({ ...prev, title_th: nextList }));
                  setIsDirty(true);
                }}
                placeholder="เช่น วิศวกรระบบ"
                addLabel={lang === "th" ? "เพิ่ม" : "Add"}
              />
              <Input className="md:col-span-3" label={lang === "th" ? "สถานที่อยู่ (TH)" : "Location (TH)"} name="location_th" value={formData.location_th} onChange={handleChange} />
            </>
          )}
          
          <div className="md:col-span-6">
            {formTab === "en" ? (
              <Input label={lang === "th" ? "ประวัติย่อ / แนะนำตัว (EN)" : "Bio (EN)"} type="textarea" name="bio_en" value={formData.bio_en} onChange={handleChange} />
            ) : (
              <Input label={lang === "th" ? "ประวัติย่อ / แนะนำตัว (TH)" : "Bio (TH)"} type="textarea" name="bio_th" value={formData.bio_th} onChange={handleChange} />
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <Button className="w-full sm:w-auto" type="submit" disabled={saving}>
            {saving ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : t("dashboard.save")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileEditor;
