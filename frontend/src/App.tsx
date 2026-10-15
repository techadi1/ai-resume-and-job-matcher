import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AuthLayout } from "./layouts/AuthLayout";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ResumeUploadPage } from "./pages/ResumeUploadPage";
import { ResumeAnalysisPage } from "./pages/ResumeAnalysisPage";
import { JobMatcherPage } from "./pages/JobMatcherPage";
import { JobDetailsPage } from "./pages/JobDetailsPage";
import { SkillGapPage } from "./pages/SkillGapPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SavedJobsPage } from "./pages/SavedJobsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Wraps DashboardLayout with auth check for use as a route element
const ProtectedDashboard: React.FC = () => (
  <ProtectedRoute>
    <DashboardLayout />
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Public or Protected Jobs Route */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<JobMatcherPage />} />
            </Route>

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedDashboard />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<ResumeUploadPage />} />
              <Route path="/resume-analyzer" element={<Navigate to="/upload" replace />} />
              <Route path="/resume-analysis/:id" element={<ResumeAnalysisPage />} />
              <Route path="/job-matcher" element={<Navigate to="/jobs" replace />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/skills" element={<SkillGapPage />} />
              <Route path="/skill-gap" element={<Navigate to="/skills" replace />} />
              <Route path="/saved-jobs" element={<SavedJobsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
