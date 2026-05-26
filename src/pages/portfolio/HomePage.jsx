import React from "react";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import { Button } from "../../components/ui/Button";

export const HomePage = () => {
  const { profile } = useOutletContext();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { username } = useParams();

  const bio = lang === "th" ? (profile.bio_th || profile.bio_en) : (profile.bio_en || profile.bio_th);
  const fullName = lang === "th" ? (profile.full_name_th || profile.full_name_en) : (profile.full_name_en || profile.full_name_th);
  const title = lang === "th" ? (profile.title_th || profile.title_en) : (profile.title_en || profile.title_th);

  return (
    <div className="space-y-16 animate-fade-in-up">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-6 py-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          {t("home.greeting")}{" "}
          <span className="text-purple-600 dark:text-purple-400">{fullName}</span>
        </h2>
        
        {title && (
          <div className="inline-block">
            <span className="text-xs tracking-widest text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1 block">
              {t("home.desiredRole")}
            </span>
            <span className="text-2xl md:text-3xl text-gray-800 dark:text-gray-200 font-medium">
              {title}
            </span>
          </div>
        )}

        {bio && (
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {bio}
          </p>
        )}

        <div className="pt-4 flex gap-4">
          <Button onClick={() => navigate(`/portfolio/${username}/project`)}>
            {t("home.viewWork")}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
          {profile.cv_url && (
            <Button variant="secondary" onClick={() => window.open(profile.cv_url, '_blank')}>
              {t("resume.downloadCV")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
