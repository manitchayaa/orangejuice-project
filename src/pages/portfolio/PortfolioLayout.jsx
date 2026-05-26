import React from "react";
import { Outlet, useParams, NavLink } from "react-router-dom";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useTranslation } from "../../hooks/useTranslation";
import { ShareButton } from "../../components/ShareButton";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const PortfolioLayout = () => {
  const { username } = useParams();
  const portfolioData = usePortfolio(username);
  const { profile, loading, error } = portfolioData;
  const { t, lang } = useTranslation();

  if (loading) {
    return <LoadingSpinner fullHeight={true} />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolio Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">The user "{username}" does not exist or has not set up their portfolio.</p>
      </div>
    );
  }

  const fullName = lang === "th" ? (profile.full_name_th || profile.full_name_en) : (profile.full_name_en || profile.full_name_th);
  const title = lang === "th" ? (profile.title_th || profile.title_en) : (profile.title_en || profile.title_th);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      {/* Portfolio Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-12 gap-6 bg-white dark:bg-gray-900/40 p-8 rounded-3xl border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img 
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${fullName}&size=128`} 
            alt={fullName} 
            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
            <p className="text-lg text-purple-600 dark:text-purple-400 font-medium mt-1">{title}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
              {profile.location_th && (
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {lang === "th" ? profile.location_th : profile.location_en || profile.location_th}
                </span>
              )}
              {profile.is_available && (
                <span className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  {t("home.available")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div>
          <ShareButton username={username} />
        </div>
      </div>

      {/* Portfolio Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 sm:gap-6 mb-8 border-b border-gray-200 dark:border-gray-800 scrollbar-hide">
        <NavLink 
          to={`/portfolio/${username}`} 
          end 
          className={({isActive}) => `whitespace-nowrap px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${isActive ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
        >
          {t("nav.home")}
        </NavLink>
        <NavLink 
          to={`/portfolio/${username}/resume`} 
          className={({isActive}) => `whitespace-nowrap px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${isActive ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
        >
          {t("nav.resume")}
        </NavLink>
        <NavLink 
          to={`/portfolio/${username}/project`} 
          className={({isActive}) => `whitespace-nowrap px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${isActive ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
        >
          {t("nav.project")}
        </NavLink>
        <NavLink 
          to={`/portfolio/${username}/certificate`} 
          className={({isActive}) => `whitespace-nowrap px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${isActive ? "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}
        >
          {t("nav.certificate")}
        </NavLink>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-gray-900/20 rounded-3xl min-h-[50vh] p-4 md:p-8">
        <Outlet context={portfolioData} />
      </div>
    </div>
  );
};

export default PortfolioLayout;
