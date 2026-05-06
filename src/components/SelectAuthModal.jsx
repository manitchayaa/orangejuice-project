import FacebookIcon from "../assets/icons/Facebook_Logo_Primary.png";
export const SelectAuthModal = ({
  setIsLoginModalOpen,
  handleGoogleLogin,
  handleFacebookLogin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full relative shadow-xl">
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ✕
        </button>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 ">
            เข้าสู่ระบบมาสนุกกับโลกในจินตนาการ!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            เตรียมตัวเข้าสู่โลกของแต่ละครีเอเตอร์ และสนุกไปกับการสำรวจ!
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 font-medium  cursor-pointer"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            เข้าสู่ระบบด้วย Google
          </button>
          <button
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 font-medium  cursor-pointer"
          >
            <img src={FacebookIcon} alt="Facebook" className="w-5 h-5" />
            เข้าสู่ระบบด้วย Facebook
          </button>
        </div>
      </div>
    </div>
  );
};
