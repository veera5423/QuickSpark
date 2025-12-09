
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './components/common/ForgotPassword';
import ResetPassword from './components/common/ResetPassword';
import VerifyEmail from './components/common/VerifyEmail';

// Dashboard Pages
import Home from './pages/Dashboard/Home';
import Resources from './pages/Dashboard/Resources';
import ResourceChat from './pages/Dashboard/ResourceChat';
import AISummarizer from './pages/Dashboard/AISummarizer';
import MockTests from './pages/Dashboard/MockTests';
import Skills from './pages/Dashboard/Skills';
import Careers from './pages/Dashboard/Careers';
import PublicResources from './pages/Dashboard/PublicResources';
import SubmitResource from './pages/Dashboard/SubmitResource';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ResumeChecker from './pages/Dashboard/ResumeChecker';

// Other Pages
import NotFound from './components/common/NotFound';
import CareerExplorer from './pages/Dashboard/CareerExplorer';
import QuizDetails from './pages/Dashboard/QuizDetails';

import AboutUs from './components/common/AboutUs';
import PrivacyPolicy from './components/common/PrivacyPolicy';
import Blog from './components/common/Blog';
import BlogPost from './components/common/BlogPost';
import Terms from './components/common/Terms';
import Contact from './components/common/Contact';
import Hero from './components/common/Hero';
import TestRefresh from './components/TestRefresh';

const AppRouter = () => {


  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } />
            <Route path="/register" element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            } />
            <Route path="/forgot-password" element={
              <AuthLayout>
                <ForgotPassword />
              </AuthLayout>
            } />
            <Route path="/reset-password/:token" element={
              <AuthLayout>
                <ResetPassword />
              </AuthLayout>
            } />
            <Route path="/verify-email/:token" element={
              <AuthLayout>
                <VerifyEmail />
              </AuthLayout>
            } />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/resources" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Resources />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/resources/chat/:resourceId" element={
              <ProtectedRoute>
                <ResourceChat />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/public-resources" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PublicResources />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/submit-resource" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SubmitResource />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/admin" element={
              <AdminProtectedRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </AdminProtectedRoute>
            } />
            <Route path="/dashboard/ai-summarizer" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AISummarizer />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/resume-check" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResumeChecker />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/mock-tests" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MockTests />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/skills" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Skills />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/careers" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Careers />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/career-explorer" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CareerExplorer />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard/quiz-details/:attemptId" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <QuizDetails />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Public Routes */}
            
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/test-refresh" element={<TestRefresh/>} />

            {/* Default redirect */}
            <Route path="/" element={<Hero/>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRouter;
