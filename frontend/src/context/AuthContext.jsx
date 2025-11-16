import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
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

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    console.log(userData.username);
    
    setUser(userData.username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated,isLoading, user, login, logout }}>
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
