import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/authAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const tempUser={
    "username": "testName",
            "email": "testEmail",
            "is_admin":true
  }
  const [user, setUser] = useState(tempUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token by making a request to a protected endpoint
      validateToken(token);
    } else {
      // No token, but show loading for at least 2 seconds for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      // Make a lightweight request to validate token
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/resources/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setIsAuthenticated(true);
        // Fetch user data after successful validation
        await getMe(token);
      } else {
        throw new Error('Invalid token');
      }
    } catch {
      // Token is invalid, remove it and show unauthorized page
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getMe = async (token) => {
    try {
      const response = await authAPI.getMe(token);
      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, getMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
