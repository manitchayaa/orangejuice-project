import React from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Badge } from "../../components/ui/Badge";

export const CertificatePage = () => {
  const { profile, certificates } = useOutletContext();
  const { t, lang } = useTranslation();

  const getLocalized = (item, field) => {
    return lang === "th" ? (item[`${field}_th`] || item[`${field}_en`]) : (item[`${field}_en`] || item[`${field}_th`]);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-12">
        <Badge className="mb-3">Certificates</Badge>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t("certificate.title")}</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t("certificate.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates?.map((cert) => (
            <div 
              key={cert.id} 
              className="flex flex-col h-full overflow-hidden p-0 group relative border border-gray-250 dark:border-gray-800 bg-transparent rounded-3xl hover:border-purple-500/30 dark:hover:border-purple-500/20 hover:shadow-[0_8px_30px_rgba(168,85,247,0.02)] hover:scale-[1.01] transition-all duration-300"
            >
              {/* Aspect Ratio [1.414] A4 Landscape Ratio with Contain Image */}
              <div className="w-full aspect-[1.414] overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-150 dark:border-gray-800 relative flex items-center justify-center">
                {cert.image_url ? (
                  <img 
                    src={cert.image_url} 
                    alt={getLocalized(cert, 'title')} 
                    className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-605">No Document Image</span>
                  </div>
                )}
                
                {cert.issue_date && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="solid" className="bg-purple-600 text-white font-extrabold shadow-sm border border-purple-500/30 text-xs px-2.5 py-1 rounded-lg">
                      {cert.issue_date}
                    </Badge>
                  </div>
                )}

                {/* Hover overlay details/descriptions */}
                <div className="absolute inset-0 bg-[#0c0c14]/90 backdrop-blur-xs flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-350 transform translate-y-2 group-hover:translate-y-0 select-none pointer-events-none group-hover:pointer-events-auto">
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                      {t("certificate.issuedBy")}
                    </span>
                    <h4 className="text-white font-black text-base leading-snug drop-shadow-xs line-clamp-3">
                      {getLocalized(cert, 'title')}
                    </h4>
                    <p className="text-gray-300 text-xs font-medium line-clamp-2">
                      {getLocalized(cert, 'issuer')}
                    </p>
                    
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        {t("certificate.viewDetails")}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 flex-grow flex flex-col justify-between bg-transparent dark:bg-transparent">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 leading-snug">
                    {getLocalized(cert, 'title')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium line-clamp-1">
                    {t("certificate.issuedBy")} {getLocalized(cert, 'issuer')}
                  </p>
                </div>
              </div>
            </div>
        ))}
        {(!certificates || certificates.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-500">
            {t("common.noData")}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;
