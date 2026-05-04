import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./HomePage";
import { useTheme } from "../store/useTheme";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/delete-data" element={<DeleteData />} />
      </Routes>
    </div>
  );
}


export default App;
