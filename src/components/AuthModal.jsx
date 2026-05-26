import React from "react";
import { Modal } from "./ui/Modal";
import { useAuth } from "../hooks/useAuth";

export const AuthModal = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In" maxWidth="max-w-md">
      <div className="flex flex-col space-y-4 py-4">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          เข้าสู่ระบบด้วยบัญชีโซเชียลของคุณ
        </p>

        {/* Google Button */}
        <button
          onClick={signInWithGoogle}
          className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm cursor-pointer"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-3" />
          Continue with Google
        </button>

        {/* Facebook Button (since user requested to keep it) */}
        <button
          onClick={signInWithFacebook}
          className="flex items-center justify-center w-full px-4 py-3 border border-transparent rounded-xl bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors font-medium shadow-sm cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="mr-3" viewBox="0 0 16 16">
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
          </svg>
          Continue with Facebook
        </button>
      </div>
    </Modal>
  );
};

export default AuthModal;
