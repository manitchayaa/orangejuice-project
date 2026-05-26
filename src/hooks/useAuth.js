import { useEffect } from "react";
import { supabase } from "../service/supabaseClient";
import { useAuthStore } from "../store/useAuthStore";

let initialized = false;

export const useAuth = () => {
  const { user, session, loading, setUser, setSession, setLoading } = useAuthStore();

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    async function getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      // Do not unsubscribe here because multiple components use this hook
      // and we want the global listener to remain active.
    };
  }, [setSession, setUser, setLoading]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: import.meta.env.VITE_REDIRECT_URL },
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: import.meta.env.VITE_REDIRECT_URL },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
  };
};

export default useAuth;
