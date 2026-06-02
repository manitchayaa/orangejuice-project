import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { helpers } from "../../utils/helpers";

export const ProjectPage = () => {
  const { profile, projects } = useOutletContext();
  const { t, lang } = useTranslation();
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const getLocalized = (item, field) => {
    return lang === "th" ? (item[`${field}_th`] || item[`${field}_en`]) : (item[`${field}_en`] || item[`${field}_th`]);
  };

  const handleOpenDetail = (project) => {
    setSelectedProject(project);
    setActiveSlide(0);
    setPresentationMode(false);
    setIsPlaying(false);
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
    setActiveSlide(0);
    setPresentationMode(false);
    setIsPlaying(false);
  };

  // Auto-play timer for slideshow in presentation mode
  useEffect(() => {
    let intervalId;
    if (presentationMode && isPlaying && selectedProject) {
      const imagesList = helpers.parseJSON(selectedProject.images, []).length > 0
        ? helpers.parseJSON(selectedProject.images, [])
        : (selectedProject.image_url ? [selectedProject.image_url] : []);
      
      if (imagesList.length > 0) {
        intervalId = setInterval(() => {
          setActiveSlide((prev) => (prev + 1) % imagesList.length);
        }, 4000);
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [presentationMode, isPlaying, selectedProject]);

  // Keyboard controls in presentation mode
  useEffect(() => {
    if (!presentationMode || !selectedProject) return;

    const imagesList = helpers.parseJSON(selectedProject.images, []).length > 0
      ? helpers.parseJSON(selectedProject.images, [])
      : (selectedProject.image_url ? [selectedProject.image_url] : []);

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setActiveSlide((prev) => (prev + 1) % imagesList.length);
      } else if (e.key === "ArrowLeft") {
        setActiveSlide((prev) => (prev - 1 + imagesList.length) % imagesList.length);
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === "Escape") {
        setPresentationMode(false);
        setIsPlaying(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [presentationMode, selectedProject]);

  const imagesList = selectedProject
    ? (helpers.parseJSON(selectedProject.images, []).length > 0
        ? helpers.parseJSON(selectedProject.images, [])
        : (selectedProject.image_url ? [selectedProject.image_url] : []))
    : [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-12">
        <Badge className="mb-3">Projects</Badge>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("project.title")}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("project.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects?.map((project) => {
          const tags = helpers.parseJSON(project.tags, []);
          
          return (
            <Card key={project.id} hover onClick={() => handleOpenDetail(project)} className="flex flex-col h-full group overflow-hidden p-0 cursor-pointer shadow-sm hover:shadow-md transition-all">
              {project.image_url ? (
                <div className="w-full h-48 overflow-hidden bg-gray-150 dark:bg-gray-800 relative animate-pulse">
                  <img 
                    src={project.image_url} 
                    alt={getLocalized(project, 'title')} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-0 transition-opacity duration-300"
                    onLoad={(e) => {
                      e.target.classList.remove('opacity-0');
                      e.target.parentElement.classList.remove('animate-pulse');
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-purple-50 dark:bg-gray-800/20 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 text-gray-400">
                  No Image
                </div>
              )}
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {getLocalized(project, 'title')}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="tag" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-none">{project.year}</Badge>
                  {tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="tag">{tag}</Badge>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow leading-relaxed">
                  {getLocalized(project, 'description')}
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm mt-auto">
                  {t("project.seeDetail")} <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Card>
          );
        })}
        {(!projects || projects.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("common.noData")}
          </div>
        )}
      </div>

      {/* Project Detail Modal with Sticky Title Header */}
      <Modal 
        isOpen={!!selectedProject} 
        onClose={handleCloseDetail} 
        maxWidth="max-w-5xl"
        title={
          selectedProject ? (
            <div className="flex flex-col text-left">
              <span className="text-[10px] sm:text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-0.5">
                {selectedProject.year} • {lang === "th" ? "รายละเอียดโครงการ" : "PROJECT DETAILS"}
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
                {getLocalized(selectedProject, 'title')}
              </span>
            </div>
          ) : ""
        }
      >
        {selectedProject && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Carousel, Description & Features */}
            <div className="md:col-span-7 lg:col-span-8 space-y-6">
              
              {/* Project Image Carousel */}
              {imagesList.length > 0 && (
                <div className="space-y-3">
                  <div className="w-full h-64 md:h-[380px] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800/60 mb-2 group/carousel relative flex items-center justify-center border border-gray-200/60 dark:border-gray-800/80 shadow-md">
                    <img 
                      src={imagesList[activeSlide]} 
                      alt={getLocalized(selectedProject, 'title')} 
                      className="w-full h-full object-contain select-none"
                    />
                    
                    {/* Prev/Next Buttons */}
                    {imagesList.length > 1 && (
                      <>
                        <button
                          onClick={() => setActiveSlide((prev) => (prev - 1 + imagesList.length) % imagesList.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-all z-10 cursor-pointer shadow-md border border-white/5"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                          onClick={() => setActiveSlide((prev) => (prev + 1) % imagesList.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-all z-10 cursor-pointer shadow-md border border-white/5"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </>
                    )}

                    {/* Dot Indicators */}
                    {imagesList.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {imagesList.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === activeSlide ? "bg-purple-600 w-5" : "bg-white/50 hover:bg-white/80"}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {imagesList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                      {imagesList.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`relative flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${i === activeSlide ? "border-purple-600 scale-95 shadow-sm" : "border-transparent opacity-60 hover:opacity-100"}`}
                        >
                          <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Project Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t("project.overview")}</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{getLocalized(selectedProject, 'description')}</p>
              </div>

              {/* Bullet list of Key Features & Responsibilities */}
              {helpers.parseJSON(selectedProject.key_features, []).length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {lang === "th" ? "คุณสมบัติเด่น & หน้าที่รับผิดชอบ" : "Key Features & Responsibilities"}
                  </h4>
                  <ul className="space-y-2.5 pl-1">
                    {helpers.parseJSON(selectedProject.key_features, []).map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 mr-3 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Metadata Sidebar (Demo / Tech Stack / Tags) */}
            <div className="md:col-span-5 lg:col-span-4 space-y-6">
              <div className="bg-gray-55/60 dark:bg-gray-850 p-6 rounded-2xl border border-gray-150 dark:border-gray-800 space-y-6">
                
                {/* Demo Action Buttons */}
                <div className="flex flex-col gap-3">
                  {selectedProject.demo_url && (
                    <a 
                      href={selectedProject.demo_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-purple-600 hover:bg-purple-750 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      {t("project.demoLink")}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {selectedProject.github_url && (
                    <a 
                      href={selectedProject.github_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs font-extrabold rounded-xl hover:opacity-90 transition-all border border-gray-250 dark:border-gray-700 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                      <span className="mr-1.5 font-bold">{t("project.githubLink")}</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
                    </a>
                  )}
                </div>

                {/* Project Tags (Categories) */}
                {helpers.parseJSON(selectedProject.tags, []).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === "th" ? "หมวดหมู่" : "Categories"}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {helpers.parseJSON(selectedProject.tags, []).map((tag, i) => (
                        <Badge key={i} variant="tag" className="text-xs px-2.5 py-1">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech Stack */}
                {helpers.parseJSON(selectedProject.tech_stack, []).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{lang === "th" ? "เทคโนโลยีที่ใช้" : "Tech Stack"}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {helpers.parseJSON(selectedProject.tech_stack, []).map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-200/40 dark:border-gray-700/40 shadow-2xs">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectPage;
