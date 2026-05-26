import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { portfolioService } from "../../service/portfolioService";
import { storageService } from "../../service/storageService";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const ProjectEditor = () => {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTab, setFormTab] = useState("en");
  const [formData, setFormData] = useState({
    title_en: "", title_th: "",
    description_en: "", description_th: "",
    content_en: "", content_th: "",
    tech_stack: "",
    tags: "",
    demo_url: "",
    github_url: "",
    year: "",
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await portfolioService.getItems("projects", user.id);
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title_en: item.title_en || "", title_th: item.title_th || "",
        description_en: item.description_en || "", description_th: item.description_th || "",
        content_en: item.content_en || "", content_th: item.content_th || "",
        tech_stack: item.tech_stack ? item.tech_stack.join(", ") : "",
        tags: item.tags ? item.tags.join(", ") : "",
        demo_url: item.demo_url || "",
        github_url: item.github_url || "",
        year: item.year || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title_en: "", title_th: "", description_en: "", description_th: "",
        content_en: "", content_th: "", tech_stack: "", tags: "",
        demo_url: "", github_url: "", year: "",
      });
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image_url = editingItem?.image_url;

      if (file) {
        image_url = await storageService.uploadFile("projects", user.id, file);
      }

      const payload = {
        title_en: formData.title_en, title_th: formData.title_th,
        description_en: formData.description_en, description_th: formData.description_th,
        content_en: formData.content_en, content_th: formData.content_th,
        tech_stack: formData.tech_stack.split(",").map(i => i.trim()).filter(Boolean),
        tags: formData.tags.split(",").map(i => i.trim()).filter(Boolean),
        demo_url: formData.demo_url,
        github_url: formData.github_url,
        year: formData.year,
        image_url,
      };

      if (editingItem) {
        await portfolioService.updateItem("projects", editingItem.id, payload);
      } else {
        await portfolioService.addItem("projects", { ...payload, profile_id: user.id });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (!window.confirm(t("dashboard.confirmDelete"))) return;
    try {
      await portfolioService.deleteItem("projects", id);
      if (imageUrl) {
        const path = imageUrl.split("projects/")[1];
        if (path) await storageService.deleteFile("projects", path);
      }
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.manageProjects")}</h2>
        <Button onClick={() => handleOpenModal()} size="sm">+ {t("dashboard.add")}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col">
            <div className="h-48 w-full bg-gray-200 dark:bg-gray-800">
              {item.image_url ? (
                <img src={item.image_url} alt="Project" className="w-full h-full object-cover" />
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
                <button onClick={() => handleDelete(item.id, item.image_url)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-full transition-colors border border-red-100 dark:border-red-500/20 shadow-sm" title={lang === "th" ? "ลบ" : "Delete"}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {projects.length === 0 && <p className="text-gray-500 italic">{t("common.noData")}</p>}

      <Modal isOpen={isModalOpen} onClose={() => !saving && setIsModalOpen(false)} title={editingItem ? (lang === "th" ? "แก้ไขผลงาน" : "Edit Project") : (lang === "th" ? "เพิ่มผลงาน" : "Add Project")}>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("en")}>{lang === "th" ? "ภาษาอังกฤษ" : "English"}</button>
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("th")}>{lang === "th" ? "ภาษาไทย" : "Thai"}</button>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{lang === "th" ? "รูปภาพหน้าปกโปรเจค" : "Project Cover Image"}</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFile(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formTab === "en" ? (
              <>
                <Input label={lang === "th" ? "ชื่อผลงาน (EN)" : "Project Title (EN)"} name="title_en" value={formData.title_en} onChange={handleChange} required />
                <Input label={lang === "th" ? "คำอธิบายย่อ (EN)" : "Short Description (EN)"} name="description_en" value={formData.description_en} onChange={handleChange} required />
              </>
            ) : (
              <>
                <Input label={lang === "th" ? "ชื่อผลงาน (TH)" : "Project Title (TH)"} name="title_th" value={formData.title_th} onChange={handleChange} />
                <Input label={lang === "th" ? "คำอธิบายย่อ (TH)" : "Short Description (TH)"} name="description_th" value={formData.description_th} onChange={handleChange} />
              </>
            )}

            <Input label={lang === "th" ? "เทคโนโลยีที่ใช้ (คั่นด้วยลูกน้ำ)" : "Tech Stack (comma separated)"} name="tech_stack" value={formData.tech_stack} onChange={handleChange} placeholder="e.g. React, Node.js" />
            <Input label={lang === "th" ? "แท็ก (คั่นด้วยลูกน้ำ)" : "Tags (comma separated)"} name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. Web App, AI" />
            <Input label={lang === "th" ? "ลิงก์ทดลองใช้งาน (Demo URL)" : "Demo URL"} type="url" name="demo_url" value={formData.demo_url} onChange={handleChange} />
            <Input label={lang === "th" ? "ลิงก์ GitHub" : "GitHub URL"} type="url" name="github_url" value={formData.github_url} onChange={handleChange} />
            <Input label={lang === "th" ? "ปีที่ทำ" : "Year"} name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2024" />
          </div>

          {formTab === "en" ? (
            <Input label={lang === "th" ? "เนื้อหาแบบละเอียด (EN)" : "Full Content (EN)"} type="textarea" name="content_en" value={formData.content_en} onChange={handleChange} />
          ) : (
            <Input label={lang === "th" ? "เนื้อหาแบบละเอียด (TH)" : "Full Content (TH)"} type="textarea" name="content_th" value={formData.content_th} onChange={handleChange} />
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={saving}>{t("dashboard.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? (lang === "th" ? "กำลังบันทึก..." : "Saving...") : t("dashboard.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectEditor;
