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
      {/* Main Content Area */}
      <main className="min-h-[50vh]">
        <Outlet context={portfolioData} />
      </main>
    </div>
  );
};

export default PortfolioLayout;
