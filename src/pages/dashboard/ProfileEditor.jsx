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

const createProfileFormData = (profile = {}) => {
  const thaiName = splitFullName(profile.full_name_th || "");
  const englishName = splitFullName(profile.full_name_en || "");

  return {
    username: profile.username || "",
    first_name_th: profile.first_name_th || thaiName.firstName,
    last_name_th: profile.last_name_th || thaiName.lastName,
    first_name_en: profile.first_name_en || englishName.firstName,
    last_name_en: profile.last_name_en || englishName.lastName,
    title_th: profile.title_th || "",
    title_en: profile.title_en || "",
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
    title_th: "", title_en: "",
    bio_th: "", bio_en: "",
    email: "", phone: "",
    location_th: "", location_en: "",
    is_available: true,
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

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

      const profilePayload = {
        username: formData.username,
        full_name_th: joinFullName(formData.first_name_th, formData.last_name_th),
        full_name_en: joinFullName(formData.first_name_en, formData.last_name_en),
        title_th: formData.title_th,
        title_en: formData.title_en,
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
    <Card className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.editProfile")}</h2>
        {formData.username && (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.open(`/portfolio/${formData.username}`, '_blank')}>
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
        <div className={`fixed top-24 right-6 z-50 p-4 rounded-xl shadow-lg border animate-fade-in-up ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-gray-800 dark:border-green-900/50 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-gray-800 dark:border-red-900/50 dark:text-red-400'}`}>
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
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{lang === "th" ? "รูปโปรไฟล์" : "Profile Picture"}</label>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400 cursor-pointer" />
          </div>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
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

          <div className="flex border-b border-gray-200 dark:border-gray-800 md:col-span-6">
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("en")}>{lang === "th" ? "ภาษาอังกฤษ" : "English"}</button>
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("th")}>{lang === "th" ? "ภาษาไทย" : "Thai"}</button>
          </div>
          
          {formTab === "en" ? (
            <>
              <Input className="md:col-span-3" label={lang === "th" ? "ชื่อ (EN)" : "First Name (EN)"} name="first_name_en" value={formData.first_name_en} onChange={handleChange} required />
              <Input className="md:col-span-3" label={lang === "th" ? "นามสกุล (EN)" : "Last Name (EN)"} name="last_name_en" value={formData.last_name_en} onChange={handleChange} required />
              <Input className="md:col-span-3" label={lang === "th" ? "ตำแหน่งงาน (EN)" : "Job Title (EN)"} name="title_en" value={formData.title_en} onChange={handleChange} placeholder="e.g. System Engineer" />
              <Input className="md:col-span-3" label={lang === "th" ? "สถานที่อยู่ (EN)" : "Location (EN)"} name="location_en" value={formData.location_en} onChange={handleChange} />
            </>
          ) : (
            <>
              <Input className="md:col-span-3" label={lang === "th" ? "ชื่อ (TH)" : "First Name (TH)"} name="first_name_th" value={formData.first_name_th} onChange={handleChange} />
              <Input className="md:col-span-3" label={lang === "th" ? "นามสกุล (TH)" : "Last Name (TH)"} name="last_name_th" value={formData.last_name_th} onChange={handleChange} />
              <Input className="md:col-span-3" label={lang === "th" ? "ตำแหน่งงาน (TH)" : "Job Title (TH)"} name="title_th" value={formData.title_th} onChange={handleChange} placeholder="เช่น วิศวกรระบบ" />
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
          <Button type="submit" disabled={saving}>
            {saving ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : t("dashboard.save")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfileEditor;
