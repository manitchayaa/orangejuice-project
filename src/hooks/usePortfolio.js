import { useState, useEffect } from "react";
import { profileService } from "../service/profileService";
import { portfolioService } from "../service/portfolioService";

export const usePortfolio = (username) => {
  const [profile, setProfile] = useState(null);
  const [data, setData] = useState({
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certificates: [],
    socialLinks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      if (!username) return;
      try {
        setLoading(true);
        setError(null);

        // Get profile first
        const p = await profileService.getProfileByUsername(username);
        if (!mounted) return;
        setProfile(p);

        // Get rest of portfolio data
        const fullData = await portfolioService.getFullPortfolio(p.id);
        if (!mounted) return;
        setData(fullData);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [username]);

  return {
    profile,
    ...data,
    loading,
    error,
  };
};

export default usePortfolio;
