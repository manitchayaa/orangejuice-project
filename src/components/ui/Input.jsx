import React from "react";

export const Input = ({
  label,
  error,
  type = "text",
  className = "",
  ...rest
}) => {
  const inputBaseClasses =
    "w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea className={`${inputBaseClasses} resize-y min-h-[100px]`} {...rest} />
      ) : (
        <input type={type} className={inputBaseClasses} {...rest} />
      )}
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </div>
  );
};

export default Input;
