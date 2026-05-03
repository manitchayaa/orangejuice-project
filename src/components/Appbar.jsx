import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../service/supabaseClient";
const Appbar = () => {
  const navigate = useNavigate();
  // Load Supabase auth
  const [session, setSession] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("User session:", session.user.user_metadata.avatar_url);
      setSession(session);
      setUser(session.user);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
    setSession(false)
    setUser(null);
  };
  return (
    <nav id="navbar" className="flex items-center justify-between p-4 bg-white shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" onClick={() => navigate("/")}>Logo</h1>
      </div>
      <div id="left-navbar" className="flex space-x-4">
        <p className="text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => navigate("/most-popular-planets")}>ยอดนิยม</p>
        <p className="text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => navigate("/weekly-planets")}>ทุกสัปดาห์</p>
        <p className="text-gray-600 hover:text-gray-800 cursor-pointer" onClick={() => navigate("/my-planets")}>โลกของฉัน</p>
      </div>

      <div id="right-navbar" className="flex items-center space-x-4">
        <img
          src={user?.user_metadata?.avatar_url || "https://wallpapers.com/images/hd/anonymous-profile-icon-lho505xc2tekvg7g-2.jpg"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <p className="text-gray-600">{user?.user_metadata?.full_name || "Guest"}</p>
          <p className="text-gray-400 text-sm">200 coins</p>
        </div> 

        {session ? (
          <button onClick={handleLogout}>ออกจากระบบ</button>
        ) : (
          <>
            <button onClick={() => navigate("/login")}>เข้าสู่ระบบ</button>
          </>
        )}
      </div>
      
    </nav>
  );
};
export default Appbar;
