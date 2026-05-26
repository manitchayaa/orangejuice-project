import React from "react";
import { useTranslation } from "../../hooks/useTranslation";

export const LoadingSpinner = ({ fullHeight = true }) => {
  const { t } = useTranslation();
  
  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 animate-fade-in-up">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse text-sm">
        {t("common.loading")}...
      </p>
    </div>
  );

  if (fullHeight) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
