import { Outlet, useParams, NavLink } from "react-router-dom";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useTranslation } from "../../hooks/useTranslation";
import { ShareButton } from "../../components/ShareButton";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const PortfolioLayout = () => {
  const { username } = useParams();
  const portfolioData = usePortfolio(username);
  const { profile, projects = [], certificates = [], experience = [], loading, error } = portfolioData;
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
  const location = lang === "th" ? profile.location_th : profile.location_en || profile.location_th;
  const navItems = [
    { to: `/portfolio/${username}`, label: t("nav.home"), end: true },
    { to: `/portfolio/${username}/resume`, label: t("nav.resume") },
    { to: `/portfolio/${username}/project`, label: t("nav.project") },
    { to: `/portfolio/${username}/certificate`, label: t("nav.certificate") },
  ];
  const stats = [
    { label: t("nav.project"), value: projects.length },
    { label: t("nav.certificate"), value: certificates.length },
    { label: t("nav.resume"), value: experience.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12 animate-fade-in-up">
      {/* Portfolio Header */}
      <header className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#101018]"></header>
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
      <nav className="sticky top-16 z-30 -mx-4 mt-5 border-y border-gray-200 bg-gray-50/90 px-4 py-3 backdrop-blur-md dark:border-gray-800 dark:bg-[#0a0a0f]/90 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20 dark:bg-purple-500"
                    : "text-gray-500 hover:bg-white hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="min-h-[50vh] pt-10">
        <Outlet context={portfolioData} />
      </main>
    </div>
  );
};

export default PortfolioLayout;
