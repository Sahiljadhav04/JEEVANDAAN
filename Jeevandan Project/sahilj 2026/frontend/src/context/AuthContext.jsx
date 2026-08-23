import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('jeevandan_user');
    const token = localStorage.getItem('jeevandan_token');
    if (saved && token) {
      setUser(JSON.parse(saved));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data.user);
    localStorage.setItem('jeevandan_user', JSON.stringify(data.user));
    localStorage.setItem('jeevandan_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const signup = async (signupData) => {
    const { data } = await axios.post('/api/auth/signup', signupData);
    setUser(data.user);
    localStorage.setItem('jeevandan_user', JSON.stringify(data.user));
    localStorage.setItem('jeevandan_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jeevandan_user');
    localStorage.removeItem('jeevandan_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
