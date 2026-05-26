import React from "react";

export const Footer = () => {
  return (
    <footer className="w-full py-8 bg-gray-50 dark:bg-[#0a0a0f] border-t border-gray-200 dark:border-gray-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Built with ❤️ | Portfolios © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
