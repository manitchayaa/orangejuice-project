import React, { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "../../hooks/useTranslation";

import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <LoadingSpinner fullHeight={true} />;
  }

  const navItems = [
    {
      path: "/dashboard",
      label: t("dashboard.editProfile"),
      exact: true,
    },
    {
      path: "/dashboard/education",
      label: t("dashboard.manageEducation"),
    },
    {
      path: "/dashboard/experience",
      label: t("dashboard.manageExperience"),
    },
    {
      path: "/dashboard/skills",
      label: t("dashboard.manageSkills"),
    },
    {
      path: "/dashboard/projects",
      label: t("dashboard.manageProjects"),
    },
    {
      path: "/dashboard/certificates",
      label: t("dashboard.manageCertificates"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {user.email}
              </p>
            </div>

            <nav className="p-3 flex gap-2 overflow-x-auto lg:block lg:space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `shrink-0 whitespace-nowrap flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="hidden lg:block my-2 border-t border-gray-100 dark:border-gray-800" />

              {user.user_metadata?.username && (
                <button
                  onClick={() =>
                    navigate(`/portfolio/${user.user_metadata.username}`)
                  }
                  className="shrink-0 whitespace-nowrap lg:w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>

                  {t("nav.myPortfolio")}
                </button>
              )}
            </nav>
          </div>
        </div>
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
