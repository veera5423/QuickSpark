import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminProtectedRoute from "./components/common/AdminProtectedRoute";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./components/common/ForgotPassword";
import ResetPassword from "./components/common/ResetPassword";
import VerifyEmail from "./components/common/VerifyEmail";

// Dashboard Pages
import Home from "./pages/Dashboard/Home";
import Resources from "./pages/Dashboard/Resources";
import ResourceChat from "./pages/Dashboard/ResourceChat";
import AISummarizer from "./pages/Dashboard/AISummarizer";
import MockTests from "./pages/Dashboard/MockTests";
import Skills from "./pages/Dashboard/Skills";
import Careers from "./pages/Dashboard/Careers";
import PublicResources from "./pages/Dashboard/PublicResources";
import SubmitResource from "./pages/Dashboard/SubmitResource";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import ResumeChecker from "./pages/Dashboard/ResumeChecker";
import VoiceInterview from "./pages/Dashboard/VoiceInterview";
import ProFeatures from "./pages/Dashboard/ProFeatures";

// Other Pages
import NotFound from "./components/common/NotFound";
import CareerExplorer from "./pages/Dashboard/CareerExplorer";
import QuizDetails from "./pages/Dashboard/QuizDetails";

import AboutUs from "./components/common/AboutUs";
import PrivacyPolicy from "./components/common/PrivacyPolicy";
import Blog from "./components/common/Blog";
import BlogPost from "./components/common/BlogPost";
import Terms from "./components/common/Terms";
import Contact from "./components/common/Contact";
import Hero from "./components/common/Hero";
import TestRefresh from "./components/TestRefresh";
import FeedbackModal from "./components/common/FeedbackModal";
import axiosClient from "./api/axiosClient";

const AppRouter = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Check if we should show feedback modal
  useEffect(() => {
    const checkFeedbackModal = () => {
      const feedbackGiven = localStorage.getItem("feedback_given");
      const feedbackSkipped = localStorage.getItem("feedback_skipped");
      const lastShown = localStorage.getItem("feedback_last_shown");

      // Don't show if feedback already given
      if (feedbackGiven) return;

      // Don't show if skipped recently (within 24 hours)
      if (feedbackSkipped) {
        const skippedTime = parseInt(feedbackSkipped);
        const hoursSinceSkipped = (Date.now() - skippedTime) / (1000 * 60 * 60);
        if (hoursSinceSkipped < 24) return;
      }

      // Don't show if shown recently (within 7 days)
      if (lastShown) {
        const lastShownTime = parseInt(lastShown);
        const daysSinceShown =
          (Date.now() - lastShownTime) / (1000 * 60 * 60 * 24);
        if (daysSinceShown < 7) return;
      }

      // Random chance (10% probability)
      if (Math.random() < 0.1) {
        localStorage.setItem("feedback_last_shown", Date.now().toString());
        setShowFeedbackModal(true);
      }
    };

    // Check after a delay to not interrupt initial loading
    const timer = setTimeout(checkFeedbackModal, 10000); // 10 seconds after app load

    return () => clearTimeout(timer);
  }, []);

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      const response = await axiosClient.post(
        "/api/mail/submit-feedback",
        feedbackData
      );
      toast("Thank You For Your Feedback!", {
        icon: "👏",
      });
      console.log("Feedback submitted successfully:", response.data);

      // Mark as given
      localStorage.setItem("feedback_given", "true");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again later.");
      console.error("Failed to submit feedback:", error);

      // Even if submission fails, mark as given to avoid spamming the user
      localStorage.setItem("feedback_given", "true");

      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      throw new Error(`Failed to submit feedback: ${errorMessage}`);
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <AuthLayout>
                  <Login />
                </AuthLayout>
              }
            />
            <Route
              path="/register"
              element={
                <AuthLayout>
                  <Register />
                </AuthLayout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <AuthLayout>
                  <ForgotPassword />
                </AuthLayout>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <AuthLayout>
                  <ResetPassword />
                </AuthLayout>
              }
            />
            <Route
              path="/verify-email/:token"
              element={
                <AuthLayout>
                  <VerifyEmail />
                </AuthLayout>
              }
            />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Home />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resources"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Resources />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resources/chat/:resourceId"
              element={
                <ProtectedRoute>
                  <ResourceChat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/public-resources"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <PublicResources />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/submit-resource"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SubmitResource />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <AdminProtectedRoute>
                  <DashboardLayout>
                    <AdminDashboard />
                  </DashboardLayout>
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/dashboard/voice-interview"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <VoiceInterview />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/pro-features"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProFeatures />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/ai-summarizer"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AISummarizer />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resume-check"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResumeChecker />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/mock-tests"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <MockTests />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/skills"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Skills />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/careers"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Careers />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/career-explorer"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <CareerExplorer />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/quiz-details/:attemptId"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <QuizDetails />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Public Routes */}

            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/test-refresh" element={<TestRefresh />} />

            {/* Default redirect */}
            <Route path="/" element={<Hero />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
            onSubmit={handleFeedbackSubmit}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRouter;
