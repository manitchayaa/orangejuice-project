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
import { helpers } from "../../utils/helpers";

const emptyProjectFormData = {
  title_en: "",
  title_th: "",
  description_en: "",
  description_th: "",
  tech_stack: [],
  tags: [],
  key_features: [],
  demo_url: "",
  github_url: "",
  year: "",
};

const parseListField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  const parsedValue = helpers.parseJSON(value, null);
  if (Array.isArray(parsedValue)) return parsedValue.filter(Boolean);

  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const normalizeList = (items) =>
  [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const ChipInput = ({ label, value, onChange, placeholder, addLabel }) => {
  const [inputValue, setInputValue] = useState("");

  const addItem = () => {
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
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="w-full min-h-[46px] px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 transition-colors">
        <div className="flex flex-wrap items-center gap-2">
          {value.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-100 dark:border-purple-500/20 px-3 py-1 text-sm">
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="text-purple-500 hover:text-purple-800 dark:hover:text-purple-100"
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
            className="rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {addLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProjectEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTab, setFormTab] = useState("en");
  const [formData, setFormData] = useState(emptyProjectFormData);
  const [imageItems, setImageItems] = useState([]); // [{ id, url, file }]
  const [saving, setSaving] = useState(false);
  const fetchedUserIdRef = useRef(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    if (fetchedUserIdRef.current === userId) return;

    let isMounted = true;

    Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const data = await portfolioService.getItems("projects", userId);
        if (isMounted) {
          setProjects(data);
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
        title_en: item.title_en || "", title_th: item.title_th || "",
        description_en: item.description_en || "", description_th: item.description_th || "",
        tech_stack: parseListField(item.tech_stack),
        tags: parseListField(item.tags),
        key_features: parseListField(item.key_features),
        demo_url: item.demo_url || "",
        github_url: item.github_url || "",
        year: item.year || "",
      });
      const existingImages = helpers.parseJSON(item.images, []);
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
      setFormData(emptyProjectFormData);
      setImageItems([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    // Revoke any blob URLs to avoid leaks
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
          const filePath = `${user.id}/project_${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
          await storageService.uploadFile("projects", filePath, item.file);
          const publicUrl = storageService.getPublicUrl("projects", filePath);
          imageUrls.push(publicUrl);
        } else if (item.url) {
          imageUrls.push(item.url);
        }
      }

      const image_url = imageUrls.length > 0 ? imageUrls[0] : "";

      const payload = {
        title_en: formData.title_en, title_th: formData.title_th,
        description_en: formData.description_en, description_th: formData.description_th,
        tech_stack: JSON.stringify(normalizeList(formData.tech_stack)),
        tags: JSON.stringify(normalizeList(formData.tags)),
        key_features: JSON.stringify(normalizeList(formData.key_features)),
        demo_url: formData.demo_url,
        github_url: formData.github_url,
        year: formData.year,
        image_url,
        images: JSON.stringify(imageUrls),
      };

      if (editingItem) {
        const updatedProject = await portfolioService.updateItem("projects", editingItem.id, payload);
        setProjects((prev) => prev.map((project) => project.id === editingItem.id ? updatedProject : project));
      } else {
        const newProject = await portfolioService.addItem("projects", { ...payload, profile_id: user.id });
        setProjects((prev) => [newProject, ...prev]);
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
      await portfolioService.deleteItem("projects", item.id);
      
      const existingImages = helpers.parseJSON(item.images, []);
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
      
      setProjects((prev) => prev.filter((project) => project.id !== item.id));
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
   <Card className="animate-fade-in-up">
   
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.manageProjects")}</h2>
        <Button onClick={() => handleOpenModal()} size="sm">+ {t("dashboard.add")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col">
            <div className="h-48 w-full bg-gray-200 dark:bg-gray-850">
              {item.image_url ? (
                <img src={item.image_url} alt="Project" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title_en || item.title_th}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description_en || item.description_th}</p>
              <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
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
      </div>
      {projects.length === 0 && <p className="text-gray-500 italic">{t("common.noData")}</p>}

      <Modal isOpen={isModalOpen} onClose={() => !saving && handleCloseModal()} title={editingItem ? (lang === "th" ? "แก้ไขผลงาน" : "Edit Project") : (lang === "th" ? "เพิ่มผลงาน" : "Add Project")}>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("en")}>{lang === "th" ? "ภาษาอังกฤษ" : "English"}</button>
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("th")}>{lang === "th" ? "ภาษาไทย" : "Thai"}</button>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {lang === "th" ? "รูปภาพผลงาน (รูปแรกจะเป็นรูปหน้าปก)" : "Project Images (First image will be the cover)"}
            </label>
            
            {/* Multi File Upload Dropzone */}
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center hover:border-purple-500 dark:hover:border-purple-500/50 transition-colors relative cursor-pointer group bg-gray-50/50 dark:bg-gray-800/10">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <svg className="w-10 h-10 mx-auto text-gray-400 group-hover:text-purple-500 transition-colors mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {lang === "th" ? "เลือกรูปภาพผลงาน (อัปโหลดพร้อมกันได้หลายรูป)" : "Choose project images (Upload multiple files)"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {lang === "th" ? "ลากและวางรูปภาพที่นี่ หรือคลิกเพื่ออัปโหลด" : "Drag and drop images here, or click to upload"}
              </p>
            </div>

            {/* Image Preview List */}
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

                    {/* Quick controls on hover */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {formTab === "en" ? (
              <>
                <Input className="md:col-span-4" label={lang === "th" ? "ชื่อผลงาน (EN)" : "Project Title (EN)"} name="title_en" value={formData.title_en} onChange={handleChange} required />
                <Input className="md:col-span-2" label={lang === "th" ? "ปีที่ทำ" : "Year"} name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2024" />
                <Input className="md:col-span-6" label={lang === "th" ? "คำอธิบายย่อ (EN)" : "Short Description (EN)"} type="textarea" name="description_en" value={formData.description_en} onChange={handleChange} required />
              </>
            ) : (
              <>
                <Input className="md:col-span-4" label={lang === "th" ? "ชื่อผลงาน (TH)" : "Project Title (TH)"} name="title_th" value={formData.title_th} onChange={handleChange} />
                <Input className="md:col-span-2" label={lang === "th" ? "ปีที่ทำ" : "Year"} name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2024" />
                <Input className="md:col-span-6" label={lang === "th" ? "คำอธิบายย่อ (TH)" : "Short Description (TH)"} type="textarea" name="description_th" value={formData.description_th} onChange={handleChange} />
              </>
            )}

            <div className="md:col-span-6">
              <ChipInput
                label={lang === "th" ? "เทคโนโลยีที่ใช้" : "Tech Stack"}
                value={formData.tech_stack}
                onChange={(value) => handleListChange("tech_stack", value)}
                placeholder={lang === "th" ? "เพิ่มเทคโนโลยี เช่น React" : "Add a technology, e.g. React"}
                addLabel={lang === "th" ? "เพิ่ม" : "Add"}
              />
            </div>
            <div className="md:col-span-6">
              <ChipInput
                label={lang === "th" ? "แท็ก" : "Tags"}
                value={formData.tags}
                onChange={(value) => handleListChange("tags", value)}
                placeholder={lang === "th" ? "เพิ่มแท็ก เช่น Web App" : "Add a tag, e.g. Web App"}
                addLabel={lang === "th" ? "เพิ่ม" : "Add"}
              />
            </div>
            <div className="md:col-span-6">
              <ChipInput
                label={lang === "th" ? "ฟีเจอร์เด่น & หน้าที่รับผิดชอบ (Key Features)" : "Key Features & Responsibilities"}
                value={formData.key_features}
                onChange={(value) => handleListChange("key_features", value)}
                placeholder={lang === "th" ? "เพิ่มฟีเจอร์เด่น/หน้าที่รับผิดชอบ (กดปุ่มเพิ่มหรือปุ่ม Enter)" : "Add feature/responsibility (press Add or Enter)"}
                addLabel={lang === "th" ? "เพิ่ม" : "Add"}
              />
            </div>
            <Input className="md:col-span-3" label={lang === "th" ? "ลิงก์ทดลองใช้งาน (Demo URL)" : "Demo URL"} type="url" name="demo_url" value={formData.demo_url} onChange={handleChange} />
            <Input className="md:col-span-3" label={lang === "th" ? "ลิงก์ GitHub" : "GitHub URL"} type="url" name="github_url" value={formData.github_url} onChange={handleChange} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={handleCloseModal} disabled={saving}>{t("dashboard.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : t("dashboard.save")}</Button>
          </div>
        </form>
      </Modal>
   </Card>
  );
};

export default ProjectEditor;
