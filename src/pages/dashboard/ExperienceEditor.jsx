import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { portfolioService } from "../../service/portfolioService";
import { storageService } from "../../service/storageService";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const parseJsonArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (e) {
    return [];
  }
};

const RowListInput = ({ label, value = [], onChange, placeholder, addLabel }) => {
  const handleItemChange = (index, newValue) => {
    const nextItems = [...value];
    nextItems[index] = newValue;
    onChange(nextItems);
  };

  const handleAddItem = () => {
    onChange([...value, ""]);
  };

  const handleRemoveItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col space-y-2.5">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-gray-400 dark:text-gray-500 font-extrabold select-none">•</span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleItemChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 rounded-xl border border-red-100 dark:border-red-500/20 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 border border-purple-100 dark:border-purple-500/20 rounded-lg transition-colors cursor-pointer w-fit"
        >
          + {addLabel}
        </button>
      </div>
    </div>
  );
};

export const ExperienceEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useTranslation();
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTab, setFormTab] = useState("en");
  const [imageItems, setImageItems] = useState([]); // [{ id, url, file }]
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company_en: "", company_th: "",
    position_en: "", position_th: "",
    description_en: "", description_th: "",
    responsibilities_en: [], responsibilities_th: [],
    learnings_en: [], learnings_th: [],
    start_date: "", end_date: "",
    type: "internship",
  });
  const fetchedUserIdRef = useRef(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId || fetchedUserIdRef.current === userId) return;

    let isMounted = true;

    Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const data = await portfolioService.getItems("experience", userId);
        if (isMounted) {
          setExperience(data);
          fetchedUserIdRef.current = userId;
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        company_en: item.company_en || "", company_th: item.company_th || "",
        position_en: item.position_en || "", position_th: item.position_th || "",
        description_en: item.description_en || "", description_th: item.description_th || "",
        responsibilities_en: parseJsonArray(item.responsibilities_en),
        responsibilities_th: parseJsonArray(item.responsibilities_th),
        learnings_en: parseJsonArray(item.learnings_en),
        learnings_th: parseJsonArray(item.learnings_th),
        start_date: item.start_date || "", end_date: item.end_date || "",
        type: item.type || "internship",
      });
      const existingImages = parseJsonArray(item.images);
      const initialImages = existingImages.length > 0
        ? existingImages
        : (item.image_url ? [item.image_url] : []);
      
      setImageItems(initialImages.map((url, idx) => ({
        id: `existing_${idx}_${Date.now()}`,
        url,
        file: null
      })));
    } else {
      setEditingItem(null);
      setFormData({
        company_en: "", company_th: "", position_en: "", position_th: "",
        description_en: "", description_th: "",
        responsibilities_en: [], responsibilities_th: [],
        learnings_en: [], learnings_th: [],
        start_date: "", end_date: "",
        type: "internship",
      });
      setImageItems([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    imageItems.forEach((item) => {
      if (item.file && item.url.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    });
    setImageItems([]);
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const newItems = newFiles.map((file) => ({
      id: `new_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setImageItems((prev) => [...prev, ...newItems]);
  };

  const handleMoveImage = (index, direction) => {
    const nextItems = [...imageItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= nextItems.length) return;
    const temp = nextItems[index];
    nextItems[index] = nextItems[targetIndex];
    nextItems[targetIndex] = temp;
    setImageItems(nextItems);
  };

  const handleDeleteImage = (id) => {
    setImageItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && target.file && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const imageUrls = [];
      for (const item of imageItems) {
        if (item.file) {
          const fileExt = item.file.name.split('.').pop();
          const filePath = `${user.id}/experience_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
          await storageService.uploadFile("projects", filePath, item.file);
          const publicUrl = storageService.getPublicUrl("projects", filePath);
          imageUrls.push(publicUrl);
        } else if (item.url) {
          imageUrls.push(item.url);
        }
      }

      const image_url = imageUrls.length > 0 ? imageUrls[0] : "";

      const payload = {
        ...formData,
        responsibilities_en: JSON.stringify(formData.responsibilities_en || []),
        responsibilities_th: JSON.stringify(formData.responsibilities_th || []),
        learnings_en: JSON.stringify(formData.learnings_en || []),
        learnings_th: JSON.stringify(formData.learnings_th || []),
        image_url,
        images: JSON.stringify(imageUrls),
      };

      if (editingItem) {
        const updatedItem = await portfolioService.updateItem("experience", editingItem.id, payload);
        setExperience((prev) => prev.map((item) => item.id === editingItem.id ? updatedItem : item));
      } else {
        const newItem = await portfolioService.addItem("experience", { ...payload, profile_id: user.id });
        setExperience((prev) => [newItem, ...prev]);
      }
      handleCloseModal();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(t("dashboard.confirmDelete"))) return;
    try {
      await portfolioService.deleteItem("experience", item.id);
      
      const existingImages = parseJsonArray(item.images);
      const urlsToDelete = existingImages.length > 0 ? existingImages : (item.image_url ? [item.image_url] : []);
      
      for (const url of urlsToDelete) {
        if (url) {
          const path = url.split("projects/")[1];
          if (path) {
            try {
              await storageService.deleteFile("projects", path);
            } catch (err) {
              console.error("Failed to delete storage file:", path, err);
            }
          }
        }
      }

      setExperience((prev) => prev.filter((exp) => exp.id !== item.id));
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.manageExperience")}</h2>
        <Button className="w-full sm:w-auto" onClick={() => handleOpenModal()} size="sm">+ {t("dashboard.add")}</Button>
      </div>

      <div className="space-y-4">
        {experience.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 dark:text-white">{item.position_en || item.position_th}</h3>
                <p className="text-sm font-medium text-blue-600">{item.company_en || item.company_th} ({item.type})</p>
                <p className="text-xs text-gray-500">{item.start_date} - {item.end_date}</p>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <button onClick={() => handleOpenModal(item)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full transition-colors border border-blue-100 dark:border-blue-500/20 shadow-sm" title={lang === "th" ? "แก้ไข" : "Edit"}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(item)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-full transition-colors border border-red-100 dark:border-red-500/20 shadow-sm" title={lang === "th" ? "ลบ" : "Delete"}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </Card>
        ))}
        {experience.length === 0 && <p className="text-gray-500 italic">{t("common.noData")}</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingItem ? (lang === "th" ? "แก้ไขประสบการณ์" : "Edit Experience") : (lang === "th" ? "เพิ่มประสบการณ์" : "Add Experience")}>
        <form onSubmit={handleSubmit} className="space-y-6 py-2 max-h-[75vh] overflow-y-auto px-1">
          <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 mb-4">
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("en")}>{lang === "th" ? "ภาษาอังกฤษ" : "English"}</button>
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("th")}>{lang === "th" ? "ภาษาไทย" : "Thai"}</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formTab === "en" ? (
              <>
                <Input label={lang === "th" ? "ชื่อบริษัท (EN)" : "Company (EN)"} name="company_en" value={formData.company_en} onChange={handleChange} required />
                <Input label={lang === "th" ? "ตำแหน่ง (EN)" : "Position (EN)"} name="position_en" value={formData.position_en} onChange={handleChange} required />
              </>
            ) : (
              <>
                <Input label={lang === "th" ? "ชื่อบริษัท (TH)" : "Company (TH)"} name="company_th" value={formData.company_th} onChange={handleChange} />
                <Input label={lang === "th" ? "ตำแหน่ง (TH)" : "Position (TH)"} name="position_th" value={formData.position_th} onChange={handleChange} />
              </>
            )}
            
            <Input label={lang === "th" ? "เดือน/ปี ที่เริ่ม" : "Start Date"} name="start_date" value={formData.start_date} onChange={handleChange} placeholder="e.g. May 2025" />
            <Input label={lang === "th" ? "เดือน/ปี ที่จบ" : "End Date"} name="end_date" value={formData.end_date} onChange={handleChange} placeholder="e.g. Jul 2025 or Present" />
            
            <div className="flex flex-col space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{lang === "th" ? "ประเภทงาน" : "Type"}</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                <option value="internship">{lang === "th" ? "ฝึกงาน (Internship)" : "Internship"}</option>
                <option value="full-time">{lang === "th" ? "งานประจำ (Full-time)" : "Full-time"}</option>
                <option value="part-time">{lang === "th" ? "งานพาร์ทไทม์ (Part-time)" : "Part-time"}</option>
                <option value="freelance">{lang === "th" ? "ฟรีแลนซ์ (Freelance)" : "Freelance"}</option>
              </select>
            </div>
          </div>

          {/* Photo upload section */}
          <div className="flex flex-col space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {lang === "th" ? "รูปภาพประกอบ (รูปแรกจะเป็นรูปหน้าปก)" : "Experience Photos (First image will be the cover)"}
            </label>
            
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-850 rounded-2xl p-6 text-center hover:border-purple-500 dark:hover:border-purple-500/50 transition-colors relative cursor-pointer group bg-gray-50/50 dark:bg-gray-800/10">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange}
                disabled={saving}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <svg className="w-10 h-10 mx-auto text-gray-400 group-hover:text-purple-500 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {lang === "th" ? "เลือกรูปภาพประกอบ (อัปโหลดพร้อมกันได้หลายรูป)" : "Choose photos (Upload multiple files)"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === "th" ? "ลากและวางรูปภาพที่นี่ หรือคลิกเพื่ออัปโหลด" : "Drag and drop images here, or click to upload"}
              </p>
            </div>

            {imageItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {imageItems.map((item, index) => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 aspect-video flex items-center justify-center shadow-sm">
                    <img src={item.url} alt="Preview" className="w-full h-full object-contain" />
                    
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-600 text-white shadow-sm z-20">
                        {lang === "th" ? "รูปหน้าปก" : "Cover"}
                      </span>
                    )}

                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-black/60 text-white backdrop-blur-sm z-20">
                      {index + 1}
                    </span>

                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-30">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveImage(index, -1)}
                        className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        title={lang === "th" ? "เลื่อนซ้าย" : "Move Left"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                      <button
                        type="button"
                        disabled={index === imageItems.length - 1}
                        onClick={() => handleMoveImage(index, 1)}
                        className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                        title={lang === "th" ? "เลื่อนขวา" : "Move Right"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(item.id)}
                        className="p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-600 transition-all ml-1"
                        title={lang === "th" ? "ลบรูป" : "Delete Image"}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {formTab === "en" ? (
            <div className="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-4">
              <Input label={lang === "th" ? "รายละเอียดงาน (EN)" : "Description (EN)"} type="textarea" name="description_en" value={formData.description_en} onChange={handleChange} />
              <RowListInput 
                label={lang === "th" ? "หน้าที่รับผิดชอบหลัก (EN)" : "Core Responsibilities (EN)"} 
                value={formData.responsibilities_en} 
                onChange={(val) => handleListChange("responsibilities_en", val)} 
                placeholder={lang === "th" ? "เช่น Developed web application modules" : "e.g. Developed web application modules"} 
                addLabel={lang === "th" ? "เพิ่มหน้าที่รับผิดชอบหลัก" : "Add Responsibility"} 
              />
              <RowListInput 
                label={lang === "th" ? "สิ่งที่ได้เรียนรู้ (EN)" : "What I've Learned (EN)"} 
                value={formData.learnings_en} 
                onChange={(val) => handleListChange("learnings_en", val)} 
                placeholder={lang === "th" ? "เช่น Gained experience in team collaboration" : "e.g. Gained experience in team collaboration"} 
                addLabel={lang === "th" ? "เพิ่มสิ่งที่ได้เรียนรู้" : "Add Learning"} 
              />
            </div>
          ) : (
            <div className="space-y-6 border-t border-gray-100 dark:border-gray-800 pt-4">
              <Input label={lang === "th" ? "รายละเอียดงาน (TH)" : "Description (TH)"} type="textarea" name="description_th" value={formData.description_th} onChange={handleChange} />
              <RowListInput 
                label={lang === "th" ? "หน้าที่รับผิดชอบหลัก (TH)" : "หน้าที่รับผิดชอบหลัก (TH)"} 
                value={formData.responsibilities_th} 
                onChange={(val) => handleListChange("responsibilities_th", val)} 
                placeholder="เช่น พัฒนาโมดูลสำหรับระบบ ERP" 
                addLabel="เพิ่มหน้าที่รับผิดชอบหลัก" 
              />
              <RowListInput 
                label={lang === "th" ? "สิ่งที่ได้เรียนรู้ (TH)" : "สิ่งที่ได้เรียนรู้ (TH)"} 
                value={formData.learnings_th} 
                onChange={(val) => handleListChange("learnings_th", val)} 
                placeholder="เช่น ได้เรียนรู้ทักษะการประสานงานร่วมกันในทีม" 
                addLabel="เพิ่มสิ่งที่ได้เรียนรู้" 
              />
            </div>
          )}
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={handleCloseModal} disabled={saving}>{t("dashboard.cancel")}</Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={saving}>{saving ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : t("dashboard.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
    </Card>
  );
};

export default ExperienceEditor;
