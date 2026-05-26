import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useLangStore = create(
  persist(
    (set) => ({
      lang: "th", // default language
      toggleLang: () =>
        set((state) => ({
          lang: state.lang === "th" ? "en" : "th",
        })),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: "portfolio-lang",
    }
  )
);
