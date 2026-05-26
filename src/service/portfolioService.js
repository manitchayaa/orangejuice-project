import { supabase } from "./supabaseClient";

export const portfolioService = {
  getItems: async (table, profileId) => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("profile_id", profileId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  addItem: async (table, item) => {
    const { data, error } = await supabase.from(table).insert(item).select().single();
    if (error) throw error;
    return data;
  },

  updateItem: async (table, id, updates) => {
    const { data, error } = await supabase.from(table).update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  deleteItem: async (table, id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  getFullPortfolio: async (profileId) => {
    const [education, experience, skills, projects, certificates, socialLinks] =
      await Promise.all([
        portfolioService.getItems("education", profileId),
        portfolioService.getItems("experience", profileId),
        portfolioService.getItems("skills", profileId),
        portfolioService.getItems("projects", profileId),
        portfolioService.getItems("certificates", profileId),
        portfolioService.getItems("social_links", profileId),
      ]);

    return {
      education,
      experience,
      skills,
      projects,
      certificates,
      socialLinks,
    };
  },
};
