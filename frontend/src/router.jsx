import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import Home from './pages/Dashboard/Home';
import Resources from './pages/Dashboard/Resources';
import MockTests from './pages/Dashboard/MockTests';
import Skills from './pages/Dashboard/Skills';
import Careers from './pages/Dashboard/Careers';

// Other Pages
import NotFound from './pages/NotFound';

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

            {/* Default redirect */}
            <Route path="/" element={<Login />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRouter;
