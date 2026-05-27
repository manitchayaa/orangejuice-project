import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { portfolioService } from "../../service/portfolioService";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const EducationEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useTranslation();
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTab, setFormTab] = useState("en");
  
  const [formData, setFormData] = useState({
    school_en: "", school_th: "",
    degree_en: "", degree_th: "",
    field_en: "", field_th: "",
    description_en: "", description_th: "",
    start_year: "", end_year: "",
  });
  const fetchedUserIdRef = useRef(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId || fetchedUserIdRef.current === userId) return;

    let isMounted = true;

    Promise.resolve().then(async () => {
      setLoading(true);
      try {
        const data = await portfolioService.getItems("education", userId);
        if (isMounted) {
          setEducation(data);
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
        school_en: item.school_en || "", school_th: item.school_th || "",
        degree_en: item.degree_en || "", degree_th: item.degree_th || "",
        field_en: item.field_en || "", field_th: item.field_th || "",
        description_en: item.description_en || "", description_th: item.description_th || "",
        start_year: item.start_year || "", end_year: item.end_year || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        school_en: "", school_th: "", degree_en: "", degree_th: "",
        field_en: "", field_th: "", description_en: "", description_th: "",
        start_year: "", end_year: "",
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
        const updatedItem = await portfolioService.updateItem("education", editingItem.id, formData);
        setEducation((prev) => prev.map((item) => item.id === editingItem.id ? updatedItem : item));
      } else {
        const newItem = await portfolioService.addItem("education", { ...formData, profile_id: user.id });
        setEducation((prev) => [newItem, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("dashboard.confirmDelete"))) return;
    try {
      await portfolioService.deleteItem("education", id);
      setEducation((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
   <Card>
     <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t("dashboard.manageEducation")}</h2>
        <Button onClick={() => handleOpenModal()} size="sm">+ {t("dashboard.add")}</Button>
      </div>

      <div className="space-y-4">
        {education.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{item.degree_en || item.degree_th}</h3>
                <p className="text-sm font-medium text-purple-600">{item.school_en || item.school_th}</p>
                <p className="text-xs text-gray-500">{item.start_year} - {item.end_year}</p>
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
        {education.length === 0 && <p className="text-gray-500 italic">{t("common.noData")}</p>}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? (lang === "th" ? "แก้ไขประวัติการศึกษา" : "Edit Education") : (lang === "th" ? "เพิ่มประวัติการศึกษา" : "Add Education")}>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          <div className="flex border-b border-gray-200 dark:border-gray-800 mb-4">
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("en")}>{lang === "th" ? "ภาษาอังกฤษ" : "English"}</button>
            <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => setFormTab("th")}>{lang === "th" ? "ภาษาไทย" : "Thai"}</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formTab === "en" ? (
              <>
                <Input label={lang === "th" ? "ชื่อสถานศึกษา (EN)" : "School/University (EN)"} name="school_en" value={formData.school_en} onChange={handleChange} required />
                <Input label={lang === "th" ? "วุฒิการศึกษา (EN)" : "Degree (EN)"} name="degree_en" value={formData.degree_en} onChange={handleChange} required />
                <Input label={lang === "th" ? "คณะ/สาขา (EN)" : "Field of Study (EN)"} name="field_en" value={formData.field_en} onChange={handleChange} />
              </>
            ) : (
              <>
                <Input label={lang === "th" ? "ชื่อสถานศึกษา (TH)" : "School/University (TH)"} name="school_th" value={formData.school_th} onChange={handleChange} />
                <Input label={lang === "th" ? "วุฒิการศึกษา (TH)" : "Degree (TH)"} name="degree_th" value={formData.degree_th} onChange={handleChange} />
                <Input label={lang === "th" ? "คณะ/สาขา (TH)" : "Field of Study (TH)"} name="field_th" value={formData.field_th} onChange={handleChange} />
              </>
            )}
            
            <Input label={lang === "th" ? "ปีที่เริ่ม" : "Start Year"} name="start_year" value={formData.start_year} onChange={handleChange} placeholder="e.g. 2022" />
            <Input label={lang === "th" ? "ปีที่จบ" : "End Year"} name="end_year" value={formData.end_year} onChange={handleChange} placeholder="e.g. 2026 or Present" />
          </div>

          {formTab === "en" ? (
            <Input label={lang === "th" ? "รายละเอียด (EN)" : "Description (EN)"} type="textarea" name="description_en" value={formData.description_en} onChange={handleChange} />
          ) : (
            <Input label={lang === "th" ? "รายละเอียด (TH)" : "Description (TH)"} type="textarea" name="description_th" value={formData.description_th} onChange={handleChange} />
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>{t("dashboard.cancel")}</Button>
            <Button type="submit">{t("dashboard.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
   </Card>
  );
};

export default EducationEditor;
