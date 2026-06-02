import { useOutletContext } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Badge } from "../../components/ui/Badge";

export const ResumePage = () => {
  const { profile, education, experience, skills } = useOutletContext();
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

  const formatTitle = (titleField) => {
    if (!titleField) return "";
    const val = String(titleField).trim();
    if (val.startsWith("[")) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.join(" / ");
      } catch (e) {
        // fallback
      }
    }
    return val;
  };

  const fullName = lang === "th" ? (profile?.full_name_th || profile?.full_name_en) : (profile?.full_name_en || profile?.full_name_th);
  const bio = lang === "th" ? (profile?.bio_th || profile?.bio_en) : (profile?.bio_en || profile?.bio_th);
  const location = lang === "th" ? (profile?.location_th || profile?.location_en) : (profile?.location_en || profile?.location_th);

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Centered Profile CV Header */}
      {profile && (
        <div className="flex flex-col items-center text-center space-y-6 w-full mb-8 py-4 bg-transparent animate-fade-in">
          <Badge className="mb-2">Resume</Badge>
          {/* Name and Title */}
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
              {fullName}
            </h2>
            {(profile.title_en || profile.title_th) && (
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {lang === "th" ? formatTitle(profile.title_th || profile.title_en) : formatTitle(profile.title_en || profile.title_th)}
              </p>
            )}
          </div>

          {/* Bio */}
          {bio && (
            <p className="text-gray-650 dark:text-gray-400 text-sm leading-relaxed max-w-4xl w-full">
              {bio}
            </p>
          )}

          {/* Contact detail pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {profile.email && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 shadow-2xs">
                <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </div>
            )}
            {profile.phone && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 shadow-2xs">
                <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {profile.phone}
              </div>
            )}
            {location && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 shadow-2xs">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </div>
            )}
          </div>

          {/* Centered Download CV button linking to profile.cv_url */}
          {profile.cv_url && (
            <a
              href={profile.cv_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-750 text-white font-bold rounded-2xl shadow-md transition-all text-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {lang === "th" ? "ดาวน์โหลด Resume / CV" : "Download Resume / CV"}
            </a>
          )}
        </div>
      )}
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
          <div className="flex flex-col h-full bg-white/60 dark:bg-[#101018]/60 border border-gray-200/60 dark:border-gray-800/80 rounded-3xl p-6 md:p-8 shadow-3xs hover:border-purple-500/20 dark:hover:border-purple-500/15 transition-all duration-300">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 border-b border-gray-150 dark:border-gray-800/60 pb-4">
              <span className="p-1.5 bg-gray-150 dark:bg-gray-850 rounded-xl">💻</span> {t("resume.technicalSkills")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {techSkills.map(skill => (
                <div 
                  key={skill.id} 
                  className="flex items-center justify-start bg-white/70 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-800/60 px-4 py-3.5 rounded-xl font-bold text-sm text-gray-800 dark:text-gray-200 shadow-3xs hover:border-purple-500/40 dark:hover:border-purple-500/30 hover:bg-purple-50/15 dark:hover:bg-purple-950/15 transition-all hover:scale-[1.01] select-none"
                >
                  <span className="truncate">{skill.name}</span>
                </div>
              ))}
              {techSkills.length === 0 && <span className="text-gray-500 text-sm col-span-full italic">No technical skills added yet.</span>}
            </div>
          </div>

          <div className="flex flex-col h-full bg-white/60 dark:bg-[#101018]/60 border border-gray-200/60 dark:border-gray-800/80 rounded-3xl p-6 md:p-8 shadow-3xs hover:border-purple-500/20 dark:hover:border-purple-500/15 transition-all duration-300">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 border-b border-gray-150 dark:border-gray-800/60 pb-4">
              <span className="p-1.5 bg-gray-150 dark:bg-gray-850 rounded-xl">🧠</span> {t("resume.softSkills")}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {softSkills.map(skill => (
                <span 
                  key={skill.id} 
                  className="inline-flex items-center px-4.5 py-2.5 bg-purple-50/60 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 rounded-full text-xs font-extrabold shadow-3xs hover:scale-[1.03] hover:border-purple-400/50 dark:hover:border-purple-500/50 hover:bg-purple-100/20 dark:hover:bg-purple-950/30 transition-all select-none"
                >
                  {skill.name}
                </span>
              ))}
              {softSkills.length === 0 && <span className="text-gray-500 text-sm italic">No soft skills added yet.</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePage;
