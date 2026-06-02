import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { helpers } from "../../utils/helpers";

export const HomePage = () => {
  const { profile, projects = [] } = useOutletContext();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { username } = useParams();

  const bio = lang === "th" ? (profile.bio_th || profile.bio_en) : (profile.bio_en || profile.bio_th);
  const fullName = lang === "th" ? (profile.full_name_th || profile.full_name_en) : (profile.full_name_en || profile.full_name_th);
  const title = lang === "th" ? (profile.title_th || profile.title_en) : (profile.title_en || profile.title_th);

  // Rotating roles state
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Project slideshow state
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const getLocalized = (item, field) => {
    return lang === "th" ? (item[`${field}_th`] || item[`${field}_en`]) : (item[`${field}_en`] || item[`${field}_th`]);
  };

  // Job title parsing
  const titles = title
    ? (title.startsWith('[') 
        ? helpers.parseJSON(title, [title]) 
        : title.split(',').map(s => s.trim()).filter(Boolean))
    : [];

  // 1. Roles Rotation effect (3 seconds)
  useEffect(() => {
    if (titles.length <= 1) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
        setFade(true);
      }, 300); // fade out duration
    }, 3000);
    return () => clearInterval(interval);
  }, [titles.length]);

  // 2. Project Slideshow Autoplay effect (4 seconds) - Pauses on hover
  useEffect(() => {
    if (projects.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [projects.length, isHovered]);

  return (
    <div className="space-y-16 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6 md:py-12">
        {/* Left Column: Job Description and profile info */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {profile.is_available && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-full border border-green-500/20 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              {t("home.available") || "Available for Hire"}
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {lang === "th" ? "สวัสดี, ผม" : "Hi, I'm"}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-cyan-500 dark:from-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {fullName}
              </span>
            </h1>

            {titles.length > 0 && (
              <div className="pt-2">
                <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-extrabold block mb-1">
                  {lang === "th" ? "ตำแหน่งที่สนใจ" : "DESIRED ROLE"}
                </span>
                <div className="h-[44px] flex items-center">
                  <span className={`text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-300 transition-all duration-300 ${fade ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2"}`}>
                    {titles[currentTitleIndex]}
                  </span>
                </div>
              </div>
            )}
          </div>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
            {t("home.welcomeDescription")}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button 
              onClick={() => navigate(`/portfolio/${username}/project`)}
              className="px-6 py-3.5 bg-purple-600 hover:bg-purple-750 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.03] text-sm shrink-0 cursor-pointer"
            >
              {lang === "th" ? "ดูผลงานของฉัน" : "View My Work"} <span className="ml-2">→</span>
            </Button>
            
            <Button 
              variant="secondary"
              onClick={() => navigate(`/portfolio/${username}/resume`)}
              className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-850 dark:text-gray-200 font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.03] text-sm shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              {lang === "th" ? "เรซูเม่ของฉัน" : "My Resume"}
            </Button>

            <Button 
              variant="secondary"
              onClick={() => navigate(`/portfolio/${username}/certificate`)}
              className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-850 dark:text-gray-200 font-bold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.03] text-sm shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l4-2.22" /></svg>
              {lang === "th" ? "ใบประกาศ" : "Certificate"}
            </Button>
          </div>
        </div>

        {/* Right Column: Automated Project Carousel with hover pausing */}
        <div className="lg:col-span-5 w-full">
          {projects.length > 0 ? (
            <div 
              className="group w-full relative flex flex-col rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-200/60 dark:border-gray-850/80 bg-white dark:bg-[#101018] transition-all hover:-translate-y-1"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Image Slideshow Container */}
              <div className="w-full relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-900">
                {projects.map((project, idx) => (
                  <div
                    key={project.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === currentProjectIndex ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"}`}
                  >
                    <img
                      src={project.image_url || `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800`}
                      alt={getLocalized(project, 'title')}
                      className="w-full h-full object-cover select-none"
                    />
                    
                    {/* Indicators Overlay */}
                    {projects.length > 1 && (
                      <>
                        <div className="absolute top-4 left-4 z-20 px-2.5 py-1 text-[10px] font-extrabold bg-black/60 text-white rounded-lg backdrop-blur-md tracking-wider">
                          {String(idx + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                        </div>
                        
                        <div className="absolute top-4 right-4 z-20 px-2.5 py-1 text-[10px] font-extrabold bg-purple-600/90 text-white rounded-lg backdrop-blur-md tracking-wider border border-purple-500/20">
                          {idx === currentProjectIndex && isHovered ? (lang === "th" ? "หยุดชั่วคราว" : "PAUSED") : "AUTO"}
                        </div>
                      </>
                    )}

                    {/* Progress visual timer line at the bottom of the image */}
                    {projects.length > 1 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
                        <div 
                          className={`h-full bg-purple-500 transition-all ${isHovered ? "w-full" : "w-0 animate-slide-timer"}`}
                          style={{ animationDuration: '4000ms', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Static Text Block below image */}
              {projects.map((project, idx) => (
                <div
                  key={`text-${project.id}`}
                  className={`w-full p-6 text-left border-t border-gray-100 dark:border-gray-800/80 transition-all duration-500 ${
                    idx === currentProjectIndex 
                      ? "block opacity-100 relative z-10" 
                      : "hidden opacity-0"
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
                    {getLocalized(project, 'title')}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {helpers.parseJSON(project.tags, []).slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="tag" className="text-[10px] px-2.5 py-0.5 border-gray-200/55 dark:border-gray-700/50">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/portfolio/${username}/project`)}
                    className="text-[10px] text-purple-600 dark:text-purple-400 font-extrabold hover:text-purple-800 dark:hover:text-purple-300 transition-colors uppercase tracking-widest mt-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    {lang === "th" ? "ดูรายละเอียดโปรเจค" : "View Project Details"} <span>→</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-900/10 text-gray-500 text-sm">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              {t("common.noData")}
            </div>
          )}

          {/* Dots below project cards */}
          {projects.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 select-none">
              {projects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentProjectIndex(idx);
                    setIsHovered(true);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === currentProjectIndex ? "bg-purple-600 w-6" : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
