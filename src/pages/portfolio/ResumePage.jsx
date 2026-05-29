import { useOutletContext } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const ResumePage = () => {
  const { education, experience, skills } = useOutletContext();
  const { t, lang } = useTranslation();

  const techSkills = skills.filter(s => s.category_en?.toLowerCase().includes('tech') || s.category_th?.includes('เทคนิค'));
  const softSkills = skills.filter(s => s.category_en?.toLowerCase().includes('soft') || s.category_th?.includes('ทำงาน'));

  const getLocalized = (item, field) => {
    return lang === "th" ? (item[`${field}_th`] || item[`${field}_en`]) : (item[`${field}_en`] || item[`${field}_th`]);
  };

  const formatEducationYear = (year) => {
    if (!/^\d{4}$/.test(String(year))) return year;
    const numericYear = Number(year);
    if (lang === "th") return String(numericYear >= 2400 ? numericYear : numericYear + 543);
    return String(numericYear >= 2400 ? numericYear - 543 : numericYear);
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Two Column Layout for Edu & Exp */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Education Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-2xl">🎓</span> {t("resume.education")}
          </h3>
          <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-8 pl-8">
            {education?.map((edu) => (
              <div key={edu.id} className="relative">
                <span className="absolute -left-10 w-4 h-4 rounded-full bg-purple-100 dark:bg-purple-900 border-2 border-purple-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                </span>
                <Badge variant="tag" className="mb-2">
                  {formatEducationYear(edu.start_year)} - {formatEducationYear(edu.end_year)}
                </Badge>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{getLocalized(edu, 'degree')}</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">{getLocalized(edu, 'school')}</p>
                <div className="space-y-0.5 text-sm text-gray-500 dark:text-gray-500">
                  {getLocalized(edu, 'faculty') && <p>{getLocalized(edu, 'faculty')}</p>}
                  {getLocalized(edu, 'major') && <p>{getLocalized(edu, 'major')}</p>}
                  {!getLocalized(edu, 'faculty') && !getLocalized(edu, 'major') && getLocalized(edu, 'field') && (
                    <p>{getLocalized(edu, 'field')}</p>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{getLocalized(edu, 'description')}</p>
              </div>
            ))}
            {(!education || education.length === 0) && (
              <p className="text-gray-500 italic">{t("common.noData")}</p>
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="text-2xl">💼</span> {t("resume.experience")}
          </h3>
          <div className="relative border-l border-gray-200 dark:border-gray-800 ml-3 space-y-8 pl-8">
            {experience?.map((exp) => (
              <div key={exp.id} className="relative">
                <span className="absolute -left-10 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                </span>
                <Badge variant="tag" className="mb-2">
                  {exp.start_date} - {exp.end_date}
                </Badge>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">{getLocalized(exp, 'position')}</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">{getLocalized(exp, 'company')} ({exp.type})</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{getLocalized(exp, 'description')}</p>
              </div>
            ))}
            {(!experience || experience.length === 0) && (
              <p className="text-gray-500 italic">{t("common.noData")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <Badge className="mb-3">{t("home.coreSkills")}</Badge>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{t("resume.skills")}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col h-full">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">💻</span> {t("resume.technicalSkills")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {techSkills.map(skill => (
                <Badge key={skill.id} variant="default" className="text-sm py-1.5 px-4">{skill.name}</Badge>
              ))}
              {techSkills.length === 0 && <span className="text-gray-500 text-sm">No technical skills added yet.</span>}
            </div>
          </Card>

          <Card className="flex flex-col h-full">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md">🧠</span> {t("resume.softSkills")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {softSkills.map(skill => (
                <Badge key={skill.id} variant="tag" className="text-sm py-1.5 px-4 bg-gray-100 dark:bg-gray-800 border-none">{skill.name}</Badge>
              ))}
              {softSkills.length === 0 && <span className="text-gray-500 text-sm">No soft skills added yet.</span>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
