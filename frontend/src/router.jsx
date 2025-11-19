import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Dashboard Pages
import Home from './pages/Dashboard/Home';
import Resources from './pages/Dashboard/Resources';
import ResourceChat from './pages/Dashboard/ResourceChat';
import AISummarizer from './pages/Dashboard/AISummarizer';
import MockTests from './pages/Dashboard/MockTests';
import Skills from './pages/Dashboard/Skills';
import Careers from './pages/Dashboard/Careers';

// Other Pages
import NotFound from './pages/NotFound';
import CareerExplorer from './pages/Dashboard/CareerExplorer';
import QuizDetails from './pages/Dashboard/QuizDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Hero from './components/common/Hero';

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
            <Route path="/dashboard/ai-summarizer" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AISummarizer />
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
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

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
