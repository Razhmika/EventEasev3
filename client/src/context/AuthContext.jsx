import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('eventease_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('eventease_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('eventease_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('eventease_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('eventease_token', res.data.token);
      localStorage.setItem('eventease_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const registerCustomer = async (formData) => {
    const res = await api.post('/auth/register/customer', formData);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('eventease_token', res.data.token);
      localStorage.setItem('eventease_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const registerVendor = async (formData) => {
    const res = await api.post('/auth/register/vendor', formData);
    if (res.success && res.data) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('eventease_token', res.data.token);
      localStorage.setItem('eventease_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('eventease_token');
    localStorage.removeItem('eventease_user');
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('eventease_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        registerCustomer,
        registerVendor,
        logout,
        updateUser
      }}
    >
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
