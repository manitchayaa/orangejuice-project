import React from "react";
import { useThemeStore } from "../store/useThemeStore";
import { useTranslation } from "../hooks/useTranslation";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-400">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          <span className="hidden sm:inline whitespace-nowrap text-white">{t("common.darkMode")}</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-amber-500">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 4.22a1 1 0 011.415 0l.884.884a1 1 0 01-1.414 1.415l-.884-.883a1 1 0 010-1.415zm-9.855 0a1 1 0 010 1.415l-.883.883a1 1 0 01-1.415-1.415l.883-.884a1 1 0 011.415 0zM10 6a4 4 0 100 8 4 4 0 000-8zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm15 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM6.636 14.636a1 1 0 011.414 0l.884.884a1 1 0 01-1.414 1.414l-.884-.884a1 1 0 010-1.414zm9.855 0a1 1 0 010 1.414l-.884.884a1 1 0 01-1.414-1.414l.884-.884a1 1 0 011.414 0zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline whitespace-nowrap text-gray-900">{t("common.lightMode")}</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
