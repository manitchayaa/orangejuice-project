import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "../store/useTheme";

import { MainLayout } from "../layouts/MainLayout";
import HomePage from "./HomePage";
import CategoryPage from "./CategoryPage";
import RankingPage from "./RankingPage";
import Privacy from "./Privacy";
import DeleteData from "./DeleteData";
function App() {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          {/* <Route path="weekly-planets" element={<HomePage />} />
          <Route path="most-popular-planets" element={<HomePage />} />
          <Route path="my-planets" element={<HomePage />} /> */}
          <Route path="category" element={<CategoryPage />} />
          <Route path="most-popular-planets" element={<RankingPage />} />
        </Route>

        <Route path="/privacy" element={<Privacy />} />
        <Route path="/delete" element={<DeleteData />} />
      </Routes>
    </div>
  );
}
export default App;
