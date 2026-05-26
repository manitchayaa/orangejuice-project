import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./store/useThemeStore";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import LandingPage from "./pages/LandingPage";
import PortfolioLayout from "./pages/portfolio/PortfolioLayout";
import HomePage from "./pages/portfolio/HomePage";
import ResumePage from "./pages/portfolio/ResumePage";
import ProjectPage from "./pages/portfolio/ProjectPage";
import CertificatePage from "./pages/portfolio/CertificatePage";

// Dashboard Pages
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ProfileEditor from "./pages/dashboard/ProfileEditor";
import EducationEditor from "./pages/dashboard/EducationEditor";
import ExperienceEditor from "./pages/dashboard/ExperienceEditor";
import SkillEditor from "./pages/dashboard/SkillEditor";
import ProjectEditor from "./pages/dashboard/ProjectEditor";
import CertificateEditor from "./pages/dashboard/CertificateEditor";

const App = () => {
  const { theme } = useThemeStore();

  // Apply theme class to html tag
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Portfolio Routes */}
          <Route path="/portfolio/:username" element={<PortfolioLayout />}>
            <Route index element={<HomePage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="project" element={<ProjectPage />} />
            <Route path="certificate" element={<CertificatePage />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<ProfileEditor />} />
            <Route path="education" element={<EducationEditor />} />
            <Route path="experience" element={<ExperienceEditor />} />
            <Route path="skills" element={<SkillEditor />} />
            <Route path="projects" element={<ProjectEditor />} />
            <Route path="certificates" element={<CertificateEditor />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
