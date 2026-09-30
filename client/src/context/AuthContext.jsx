import React, { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('manpower_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (loginId, password) => {
    const res = await API.post('/auth/login', { loginId, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('manpower_token', newToken);
    localStorage.setItem('manpower_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const registerSendOtp = async (formData) => {
    const res = await API.post('/auth/register-send-otp', formData);
    return res.data;
  };

  const registerVerifyOtp = async (email, otp) => {
    const res = await API.post('/auth/register-verify-otp', { email, otp });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('manpower_token', newToken);
    localStorage.setItem('manpower_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('manpower_token');
    localStorage.removeItem('manpower_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerSendOtp, registerVerifyOtp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

