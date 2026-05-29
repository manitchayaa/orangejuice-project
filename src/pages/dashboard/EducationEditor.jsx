import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { portfolioService } from "../../service/portfolioService";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const EDUCATION_LEVELS = [
  { value: "lower_secondary", en: "Lower Secondary School", th: "มัธยมศึกษาตอนต้น" },
  { value: "upper_secondary", en: "Upper Secondary School", th: "มัธยมศึกษาตอนปลาย" },
  { value: "vocational_certificate", en: "Vocational Certificate", th: "ประกาศนียบัตรวิชาชีพ (ปวช.)" },
  { value: "high_vocational_certificate", en: "High Vocational Certificate", th: "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)" },
  { value: "diploma", en: "Diploma", th: "อนุปริญญา/ประกาศนียบัตร" },
  { value: "bachelor", en: "Bachelor's Degree", th: "ปริญญาตรี" },
  { value: "graduate_diploma", en: "Graduate Diploma", th: "ประกาศนียบัตรบัณฑิต" },
  { value: "master", en: "Master's Degree", th: "ปริญญาโท" },
  { value: "doctoral", en: "Doctoral Degree", th: "ปริญญาเอก" },
];

const EMPTY_FORM = {
  school_en: "",
  school_th: "",
  degree_en: "",
  degree_th: "",
  faculty_en: "",
  faculty_th: "",
  major_en: "",
  major_th: "",
  field_en: "",
  field_th: "",
  description_en: "",
  description_th: "",
  start_year: "",
  end_year: "",
};

const yearOptions = ["CE", "BE"];

const toDisplayYear = (year, system) => {
  if (!/^\d{4}$/.test(String(year))) return year || "";
  const numericYear = Number(year);
  if (system === "BE") return String(numericYear >= 2400 ? numericYear : numericYear + 543);
  return String(numericYear >= 2400 ? numericYear - 543 : numericYear);
};

const toCommonEraYear = (year, system) => {
  if (!/^\d{4}$/.test(String(year))) return year || "";
  const numericYear = Number(year);
  if (system === "BE") return String(numericYear >= 2400 ? numericYear - 543 : numericYear);
  return String(numericYear >= 2400 ? numericYear - 543 : numericYear);
};

export const EducationEditor = () => {
  const { user, loading: authLoading } = useAuth();
  const { t, lang } = useTranslation();
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formTab, setFormTab] = useState("en");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [yearSystem, setYearSystem] = useState({ start_year: "CE", end_year: "CE" });
  const [errors, setErrors] = useState({});
  const fetchedUserIdRef = useRef(null);

  const isThai = lang === "th";

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

  const getEducationLevelValue = (item) => {
    const match = EDUCATION_LEVELS.find(
      (level) => level.en === item.degree_en || level.th === item.degree_th
    );
    return match?.value || "";
  };

  const getLocalized = (item, field) => {
    return lang === "th" ? item[`${field}_th`] || item[`${field}_en`] : item[`${field}_en`] || item[`${field}_th`];
  };

  const formatYear = (year) => toDisplayYear(year, lang === "th" ? "BE" : "CE");

  const handleOpenModal = (item = null) => {
    setErrors({});
    setFormTab("en");
    setYearSystem({ start_year: "CE", end_year: "CE" });

    if (item) {
      setEditingItem(item);
      setFormData({
        ...EMPTY_FORM,
        school_en: item.school_en || "",
        school_th: item.school_th || "",
        degree_en: item.degree_en || "",
        degree_th: item.degree_th || "",
        faculty_en: item.faculty_en || "",
        faculty_th: item.faculty_th || "",
        major_en: item.major_en || "",
        major_th: item.major_th || "",
        field_en: item.field_en || "",
        field_th: item.field_th || "",
        description_en: item.description_en || "",
        description_th: item.description_th || "",
        start_year: item.start_year || "",
        end_year: item.end_year || "",
      });
    } else {
      setEditingItem(null);
      setFormData(EMPTY_FORM);
    }

    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTabChange = (nextTab) => {
    const nextSystem = nextTab === "th" ? "BE" : "CE";
    setFormTab(nextTab);
    setFormData((prev) => ({
      ...prev,
      start_year: toDisplayYear(toCommonEraYear(prev.start_year, yearSystem.start_year), nextSystem),
      end_year: toDisplayYear(toCommonEraYear(prev.end_year, yearSystem.end_year), nextSystem),
    }));
    setYearSystem({ start_year: nextSystem, end_year: nextSystem });
  };

  const handleDegreeChange = (e) => {
    const selected = EDUCATION_LEVELS.find((level) => level.value === e.target.value);
    setFormData((prev) => ({
      ...prev,
      degree_en: selected?.en || "",
      degree_th: selected?.th || "",
    }));
    setErrors((prev) => ({ ...prev, degree: "" }));
  };

  const handleYearChange = (e) => {
    const { name, value } = e.target;
    if (/^\d{0,4}$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleYearSystemChange = (name, value) => {
    const commonEraYear = toCommonEraYear(formData[name], yearSystem[name]);
    setFormData((prev) => ({ ...prev, [name]: toDisplayYear(commonEraYear, value) }));
    setYearSystem((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const activeSuffix = formTab === "th" ? "th" : "en";
    const requiredFields = [
      `school_${activeSuffix}`,
      `faculty_${activeSuffix}`,
      `major_${activeSuffix}`,
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        nextErrors[field] = isThai ? "กรุณากรอกข้อมูล" : "This field is required";
      }
    });

    if (!formData.degree_en || !formData.degree_th) {
      nextErrors.degree = isThai ? "กรุณาเลือกวุฒิการศึกษา" : "Please select an education level";
    }

    ["start_year", "end_year"].forEach((field) => {
      const value = formData[field]?.trim();
      if (!value) {
        nextErrors[field] = isThai ? "กรุณากรอกปีเป็นตัวเลข" : "Year is required";
      } else if (!/^\d{4}$/.test(value)) {
        nextErrors[field] = isThai ? "ปีต้องเป็นตัวเลข 4 หลักเท่านั้น" : "Use a 4-digit numeric year";
      }
    });

    const start = Number(toCommonEraYear(formData.start_year, yearSystem.start_year));
    const end = Number(toCommonEraYear(formData.end_year, yearSystem.end_year));
    if (!nextErrors.start_year && !nextErrors.end_year && start > end) {
      nextErrors.end_year = isThai ? "ปีที่จบต้องไม่น้อยกว่าปีที่เริ่ม" : "End year must be after start year";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      start_year: toCommonEraYear(formData.start_year, yearSystem.start_year),
      end_year: toCommonEraYear(formData.end_year, yearSystem.end_year),
      field_en: "",
      field_th: "",
    };

    try {
      if (editingItem) {
        const updatedItem = await portfolioService.updateItem("education", editingItem.id, payload);
        setEducation((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));
      } else {
        const newItem = await portfolioService.addItem("education", { ...payload, profile_id: user.id });
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

  const renderYearField = (name, label) => (
    <div className="flex flex-col space-y-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="grid grid-cols-[1fr_96px] gap-2">
        <input
          name={name}
          value={formData[name]}
          onChange={handleYearChange}
          inputMode="numeric"
          maxLength={4}
          placeholder={yearSystem[name] === "BE" ? "2567" : "2024"}
          required
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />
        <select
          value={yearSystem[name]}
          onChange={(e) => handleYearSystemChange(name, e.target.value)}
          className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-gray-100"
        >
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option === "BE" ? "พ.ศ." : "ค.ศ."}
            </option>
          ))}
        </select>
      </div>
      {errors[name] && <span className="text-xs text-red-500 mt-1">{errors[name]}</span>}
    </div>
  );

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
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{getLocalized(item, "degree")}</h3>
                  <p className="text-sm font-medium text-purple-600">{getLocalized(item, "school")}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {[getLocalized(item, "faculty"), getLocalized(item, "major") || getLocalized(item, "field")]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                  <p className="text-xs text-gray-500">{formatYear(item.start_year)} - {formatYear(item.end_year)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(item)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-full transition-colors border border-blue-100 dark:border-blue-500/20 shadow-sm" title={isThai ? "แก้ไข" : "Edit"}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-full transition-colors border border-red-100 dark:border-red-500/20 shadow-sm" title={isThai ? "ลบ" : "Delete"}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {education.length === 0 && <p className="text-gray-500 italic">{t("common.noData")}</p>}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingItem ? (isThai ? "แก้ไขประวัติการศึกษา" : "Edit Education") : (isThai ? "เพิ่มประวัติการศึกษา" : "Add Education")}
        >
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "en" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => handleTabChange("en")}>{isThai ? "ภาษาอังกฤษ" : "English"}</button>
              <button type="button" className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${formTab === "th" ? "border-purple-500 text-purple-600 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`} onClick={() => handleTabChange("th")}>{isThai ? "ภาษาไทย" : "Thai"}</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formTab === "en" ? (
                  <>
                    <Input label={isThai ? "สถานศึกษา (EN)" : "School/University (EN)"} name="school_en" value={formData.school_en} onChange={handleChange} error={errors.school_en} required />
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isThai ? "วุฒิการศึกษา" : "Education Level"}</label>
                      <select value={getEducationLevelValue(formData)} onChange={handleDegreeChange} required className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-gray-100">
                        <option value="">{isThai ? "เลือกวุฒิการศึกษา" : "Select education level"}</option>
                        {EDUCATION_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>{level.en}</option>
                        ))}
                      </select>
                      {errors.degree && <span className="text-xs text-red-500 mt-1">{errors.degree}</span>}
                    </div>
                  </>
                ) : (
                  <>
                    <Input label={isThai ? "สถานศึกษา (TH)" : "School/University (TH)"} name="school_th" value={formData.school_th} onChange={handleChange} error={errors.school_th} required />
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{isThai ? "วุฒิการศึกษา" : "Education Level"}</label>
                      <select value={getEducationLevelValue(formData)} onChange={handleDegreeChange} required className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-gray-900 dark:text-gray-100">
                        <option value="">{isThai ? "เลือกวุฒิการศึกษา" : "Select education level"}</option>
                        {EDUCATION_LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>{level.th}</option>
                        ))}
                      </select>
                      {errors.degree && <span className="text-xs text-red-500 mt-1">{errors.degree}</span>}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formTab === "en" ? (
                  <>
                    <Input label={isThai ? "คณะ (EN)" : "Faculty (EN)"} name="faculty_en" value={formData.faculty_en} onChange={handleChange} error={errors.faculty_en} required />
                    <Input label={isThai ? "สาขา (EN)" : "Major/Program (EN)"} name="major_en" value={formData.major_en} onChange={handleChange} error={errors.major_en} required />
                  </>
                ) : (
                  <>
                    <Input label={isThai ? "คณะ (TH)" : "Faculty (TH)"} name="faculty_th" value={formData.faculty_th} onChange={handleChange} error={errors.faculty_th} required />
                    <Input label={isThai ? "สาขา (TH)" : "Major/Program (TH)"} name="major_th" value={formData.major_th} onChange={handleChange} error={errors.major_th} required />
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderYearField("start_year", isThai ? "ปีที่เริ่ม" : "Start Year")}
                {renderYearField("end_year", isThai ? "ปีที่จบ" : "End Year")}
              </div>
            </div>

            {formTab === "en" ? (
              <Input label={isThai ? "รายละเอียด (EN)" : "Description (EN)"} type="textarea" name="description_en" value={formData.description_en} onChange={handleChange} />
            ) : (
              <Input label={isThai ? "รายละเอียด (TH)" : "Description (TH)"} type="textarea" name="description_th" value={formData.description_th} onChange={handleChange} />
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
