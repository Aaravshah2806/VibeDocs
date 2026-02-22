import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('vibedocs_token'));

  const API_URL = '';

  useEffect(() => {
    if (token) {
      localStorage.setItem('vibedocs_token', token);
      fetchUser(token);
    } else {
      localStorage.removeItem('vibedocs_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      console.log('Initiating login to:', `${API_URL}/api/auth/github/login`);
      const response = await fetch(`${API_URL}/api/auth/github/login`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No login URL received from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}. Is the backend running? Check port 8001.`);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('vibedocs_token');
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setToken,
    isSignedIn: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
