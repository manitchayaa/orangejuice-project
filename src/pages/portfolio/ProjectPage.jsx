import React, { useState } from "react";
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

  const getLocalized = (item, field) => {
    return lang === "th" ? (item[`${field}_th`] || item[`${field}_en`]) : (item[`${field}_en`] || item[`${field}_th`]);
  };

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
            <Card key={project.id} hover onClick={() => setSelectedProject(project)} className="flex flex-col h-full group overflow-hidden p-0">
              {project.image_url && (
                <div className="w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={project.image_url} 
                    alt={getLocalized(project, 'title')} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="tag" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-none">{project.year}</Badge>
                  {tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="tag">{tag}</Badge>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {getLocalized(project, 'title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
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

      {/* Project Detail Modal */}
      <Modal isOpen={!!selectedProject} onClose={() => setSelectedProject(null)} maxWidth="max-w-4xl">
        {selectedProject && (
          <div className="space-y-6">
            {selectedProject.image_url && (
              <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6">
                <img 
                  src={selectedProject.image_url} 
                  alt={getLocalized(selectedProject, 'title')} 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="tag" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-none">{selectedProject.year}</Badge>
              {helpers.parseJSON(selectedProject.tags, []).map((tag, i) => (
                <Badge key={i} variant="tag">{tag}</Badge>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{getLocalized(selectedProject, 'title')}</h2>
            
            <div className="flex flex-wrap gap-2 my-4">
              {helpers.parseJSON(selectedProject.tech_stack, []).map((tech, i) => (
                <span key={i} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md">
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
              {selectedProject.demo_url && (
                <a href={selectedProject.demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full hover:bg-purple-700 transition-colors">
                  {t("project.demoLink")}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {selectedProject.github_url && (
                <a href={selectedProject.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium rounded-full hover:opacity-90 transition-opacity">
                  {t("project.githubLink")}
                </a>
              )}
            </div>

            <div className="space-y-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("project.overview")}</h3>
              <p>{getLocalized(selectedProject, 'description')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProjectPage;
