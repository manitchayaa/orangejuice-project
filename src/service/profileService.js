import { supabase } from "./supabaseClient";

export const profileService = {
  getProfileByUsername: async (username) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();
    if (error) throw error;
    return data;
  },

  getProfileById: async (id) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle(); // Use maybeSingle to prevent PGRST116 if row doesn't exist yet
    if (error) throw error;
    return data || {}; // Return empty object if no profile exists yet
  },

  updateProfile: async (id, updates) => {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id, ...updates }) // Use upsert to insert if it doesn't exist
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  checkUsernameAvailable: async (username, excludeId = null) => {
    let query = supabase.from("profiles").select("id").eq("username", username);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data.length === 0;
  },
};
