import React from "react";

export const Card = ({ children, className = "", hover = false, onClick }) => {
  const baseClasses = "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 transition-all duration-300";
  const hoverClasses = hover ? "hover:scale-[1.02] hover:shadow-lg hover:border-purple-500/30 cursor-pointer" : "shadow-sm";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
