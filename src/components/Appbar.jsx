import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../service/supabaseClient";
const Appbar = () => {
  const navigate = useNavigate();
  // Load Supabase auth
  const [session, setSession] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    }
    setSession(false)
  };
  return (
    <nav id="navbar" className="flex items-center justify-between p-4 bg-white shadow-md">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Logo</h1>
      </div>
      <div id="left-navbar" className="flex space-x-4">
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
