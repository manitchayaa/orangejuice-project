import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { portfolioService } from "../../service/portfolioService";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const ExperienceEditor = () => {
  const { user } = useAuth();
  const { t, lang } = useTranslation();
  const [experience, setExperience] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTab, setFormTab] = useState("en");
  
  const [formData, setFormData] = useState({
    company_en: "", company_th: "",
    position_en: "", position_th: "",
    description_en: "", description_th: "",
    start_date: "", end_date: "",
    type: "internship",
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await portfolioService.getItems("experience", user.id);
      setExperience(data);
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
        company_en: item.company_en || "", company_th: item.company_th || "",
        position_en: item.position_en || "", position_th: item.position_th || "",
        description_en: item.description_en || "", description_th: item.description_th || "",
        start_date: item.start_date || "", end_date: item.end_date || "",
        type: item.type || "internship",
      });
    } else {
      setEditingItem(null);
      setFormData({
        company_en: "", company_th: "", position_en: "", position_th: "",
        description_en: "", description_th: "", start_date: "", end_date: "",
        type: "internship",
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await portfolioService.updateItem("experience", editingItem.id, formData);
      } else {
        await portfolioService.addItem("experience", { ...formData, profile_id: user.id });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("dashboard.confirmDelete"))) return;
    try {
      await portfolioService.deleteItem("experience", id);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.manageExperience")}</h2>
        <Button onClick={() => handleOpenModal()} size="sm">+ {t("dashboard.add")}</Button>
      </div>

      <div className="space-y-4">
        {experience.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{item.position_en || item.position_th}</h3>
                <p className="text-sm font-medium text-blue-600">{item.company_en || item.company_th} ({item.type})</p>
                <p className="text-xs text-gray-500">{item.start_date} - {item.end_date}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(item)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full transition-colors border border-blue-100 dark:border-blue-500/20 shadow-sm" title={lang === "th" ? "แก้ไข" : "Edit"}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-full transition-colors border border-red-100 dark:border-red-500/20 shadow-sm" title={lang === "th" ? "ลบ" : "Delete"}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </Card>
        ))}
        {experience.length === 0 && <p className="text-gray-500 italic">{t("common.noData")}</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? (lang === "th" ? "แก้ไขประสบการณ์" : "Edit Experience") : (lang === "th" ? "เพิ่มประสบการณ์" : "Add Experience")}>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
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
          
          {formTab === "en" ? (
            <Input label={lang === "th" ? "รายละเอียดงาน (EN)" : "Description (EN)"} type="textarea" name="description_en" value={formData.description_en} onChange={handleChange} />
          ) : (
            <Input label={lang === "th" ? "รายละเอียดงาน (TH)" : "Description (TH)"} type="textarea" name="description_th" value={formData.description_th} onChange={handleChange} />
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t("dashboard.cancel")}</Button>
            <Button type="submit">{t("dashboard.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExperienceEditor;
