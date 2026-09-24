import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fairforge_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('fairforge_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state and check validity with /me endpoint
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('fairforge_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('fairforge_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('fairforge_logout', handleLogoutEvent);
    return () => window.removeEventListener('fairforge_logout', handleLogoutEvent);
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('fairforge_token', newToken);
      localStorage.setItem('fairforge_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  // Register handler
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('fairforge_token', newToken);
      localStorage.setItem('fairforge_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('fairforge_token');
    localStorage.removeItem('fairforge_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
