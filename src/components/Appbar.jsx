// NavLink คือ รู้ว่า เราอยู่หน้าไหนอยู่
// useNavigate คือ กดแล้วไปหน้าไหน เปลี่ยน route แต่ไม่รู้ว่าเราอยู่หน้าไหนอยู่
import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../service/supabaseClient";
import { useTheme } from "../store/useTheme";

//component
import { SelectAuthModal } from "./SelectAuthModal";
const Appbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  console.log("user", user);
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

  // login google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: import.meta.env.VITE_REDIRECT_URL },
    });
    if (error) alert(error.message);
  };

  //login facebook
  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: import.meta.env.VITE_REDIRECT_URL },
    });
    if (error) alert(error.message);
  };

  return (
    <nav
      className="
      fixed 
      w-full 
     bg-white dark:bg-[#0f0f0f]
      border-b border-gray-200 dark:border-gray-800 
      transition-colors duration-300
      h-16
     
     "
    >
      {/* Container ครอบเนื้อหาเพื่อให้ชิดกลาง */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Modal Login */}
        {isLoginModalOpen && (
          <SelectAuthModal
            setIsLoginModalOpen={setIsLoginModalOpen}
            handleGoogleLogin={handleGoogleLogin}
            handleFacebookLogin={handleFacebookLogin}
          />
        )}

        {/* --- ส่วน Nav ด้านซ้าย (Logo + เมนู) --- */}
        <div className="flex items-center gap-6">
          <h1
            className="text-3xl font-bold text-purple-500 cursor-pointer mr-2"
            onClick={() => navigate("/")}
          >
            PLUTORY
          </h1>

          {/* เมนูนำทาง */}
          <div className="text-lg md:flex items-center gap-5   leading-none">
            <NavLink
              to="category"
              className={({ isActive }) =>
                `font-medium text-gray-800 dark:text-gray-200 
                  cursor-pointer
                 hover:text-purple-400 
                 transition-colors 
                  leading-none
                 ${isActive ? "text-purple-400 dark:text-purple-400" : ""}
                 
                 `
              }
            >
              หมวดหมู่
            </NavLink>
            <NavLink
              to="most-popular-planets"
              className={({ isActive }) =>
                `font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:text-purple-400 transition-colors ${isActive ? "text-purple-200 dark:text-purple-200" : ""}`
              }
            >
              อันดับ
            </NavLink>
          </div>
        </div>

        {/* --- ส่วน Nav ด้านขวา (Action Buttons) --- */}
        <div className="flex items-center space-x-4" ref={dropdownRef}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="cursor-pointer p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 text-gray-600 dark:text-gray-300 "
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5  cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5  cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>

          {session ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="cursor-pointer px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all"
                >
                  {user?.user_metadata?.full_name || "User"}
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-2">
                    <button
                      onClick={() => navigate("/my-planets")}
                      className="cursor-pointer w-full px-4 py-2 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      โลกของฉัน
                    </button>
                    <hr className="my-1 border-gray-100 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-sm font-bold hover:opacity-80 transition-opacity cursor-pointer"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Appbar;
