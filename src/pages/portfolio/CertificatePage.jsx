import React from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Card } from "../../components/ui/Card";
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
          <Card key={cert.id} className="flex flex-col h-full overflow-hidden p-0 group">
            {cert.image_url ? (
              <div className="w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 relative">
                <img 
                  src={cert.image_url} 
                  alt={getLocalized(cert, 'title')} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {cert.issue_date && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="solid" className="shadow-sm">{cert.issue_date.substring(0, 4)}</Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-32 bg-purple-50 dark:bg-gray-800 flex items-center justify-center border-b border-gray-100 dark:border-gray-800 relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {cert.issue_date && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="tag" className="shadow-sm">{cert.issue_date.substring(0, 4)}</Badge>
                  </div>
                )}
              </div>
            )}
            
            <div className="p-5 flex-grow flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 leading-snug">
                {getLocalized(cert, 'title')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {t("certificate.issuedBy")} {getLocalized(cert, 'issuer')}
              </p>
              
              {cert.credential_url && (
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <a 
                    href={cert.credential_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-purple-600 dark:text-purple-400 text-sm font-medium hover:text-purple-700 dark:hover:text-purple-300 flex items-center"
                  >
                    {t("certificate.viewDetails")}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </Card>
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
