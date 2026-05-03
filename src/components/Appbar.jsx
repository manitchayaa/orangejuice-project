import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../service/supabaseClient";
import { useTheme } from "../store/useTheme";

const Appbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) setIsLoginModalOpen(false);
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: import.meta.env.VITE_REDIRECT_URL },
    });
    if (error) alert(error.message);
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative transition-colors duration-300">
      {/* Container ครอบเนื้อหาเพื่อให้ชิดกลาง */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* Modal Login */}
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full relative shadow-xl">
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">เข้าสู่ระบบมาสนุกกับโลกในจินตนาการ!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">เตรียมตัวเข้าสู่โลกของแต่ละครีเอเตอร์ และสนุกไปกับการสำรวจ!</p>
              </div>
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-gray-700 dark:text-gray-200 font-medium">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                เข้าสู่ระบบด้วย Google
              </button>
            </div>
          </div>
        )}

        {/* --- ส่วน Nav ด้านซ้าย (Logo + เมนู) --- */}
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-purple-500 cursor-pointer mr-2" onClick={() => navigate("/")}>PLUTO</h1>
          
          {/* เมนูนำทาง */}
          <div className="hidden md:flex items-center gap-5">
              <p className="font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-purple-500 transition-colors" onClick={() => navigate("/most-popular-planets")}>ยอดนิยม</p>
              <p className="font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-purple-500 transition-colors" onClick={() => navigate("/weekly-planets")}>หมวดหมู่</p>
              <p className="font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-purple-500 transition-colors" onClick={() => navigate("/my-planets")}>โลกของฉัน</p>
          </div>
        </div>

        {/* --- ส่วน Nav ด้านขวา (Action Buttons) --- */}
        <div className="flex items-center space-x-4" ref={dropdownRef}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-gray-600 dark:text-gray-300 "
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>

          {session ? (
            <>
              <div className="relative">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all"
                >
                  {user?.user_metadata?.full_name || "User"}
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-2">
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button 
                      onClick={handleLogout} 
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button onClick={() => setIsLoginModalOpen(true)} className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold hover:opacity-80 transition-opacity">เข้าสู่ระบบ</button>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Appbar;
