import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { AuthModal } from "./AuthModal";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { username } = useParams();
  const location = useLocation();
  
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isPortfolioView = location.pathname.startsWith("/portfolio/");
  const pathUsername = isPortfolioView ? location.pathname.split("/")[2] : null;
  const isDashboard = location.pathname.startsWith("/dashboard");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <>
      <nav className={`${isDashboard ? "relative" : "fixed top-0 left-0"} w-full h-16 bg-white/80 dark:bg-[#12121a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-40 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo & Portfolio Navigation */}
          <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0 mr-4">
            <div 
              onClick={() => navigate(isPortfolioView && pathUsername ? `/portfolio/${pathUsername}` : "/")}
              className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 cursor-pointer shrink-0"
            >
              Portfolios
            </div>

            {isPortfolioView && pathUsername && (
              <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1 border-l border-gray-200 dark:border-gray-800 pl-3 sm:pl-5">
                {[
                  { to: `/portfolio/${pathUsername}`, label: t("nav.home"), end: true },
                  { to: `/portfolio/${pathUsername}/resume`, label: t("nav.resume") },
                  { to: `/portfolio/${pathUsername}/project`, label: t("nav.project") },
                  { to: `/portfolio/${pathUsername}/certificate`, label: t("nav.certificate") },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `whitespace-nowrap px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                        isActive
                           ? "bg-purple-600 text-white shadow-xs"
                           : "text-gray-500 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <LangToggle />
            
            {!isPortfolioView && (
              <>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1"></div>

                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 sm:pl-2 sm:pr-4 sm:py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <img 
                        src={user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user.user_metadata?.full_name || "User")} 
                        alt="avatar" 
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                        {user.user_metadata?.full_name || "User"}
                      </span>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 overflow-hidden">
                        <button
                          onClick={() => { setDropdownOpen(false); navigate("/dashboard"); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          {t("nav.dashboard")}
                        </button>
                        {user.user_metadata?.username && (
                          <button
                            onClick={() => { setDropdownOpen(false); navigate(`/portfolio/${user.user_metadata.username}`); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            {t("nav.myPortfolio")}
                          </button>
                        )}
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                        >
                          {t("nav.logout")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-4 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {t("nav.login")}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
