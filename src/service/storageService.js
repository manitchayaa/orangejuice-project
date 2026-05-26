import { supabase } from "./supabaseClient";

export const storageService = {
  uploadFile: async (bucket, path, file) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) throw error;
    return data;
  },

  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return true;
  },

  getPublicUrl: (bucket, path) => {
    if (!path) return "";
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
