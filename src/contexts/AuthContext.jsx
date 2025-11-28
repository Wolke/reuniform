import { createContext, useContext, useState, useEffect } from 'react';
import * as LiffAuth from '../liff-auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liffReady, setLiffReady] = useState(false);

  useEffect(() => {
    initializeLiff();
  }, []);

  const initializeLiff = async () => {
    try {
      setLoading(true);

      // Initialize LIFF SDK
      const success = await LiffAuth.initializeLIFF();

      if (!success) {
        console.error('LIFF initialization failed');
        setLoading(false);
        return;
      }

      setLiffReady(true);

      // Check if user is logged in
      if (LiffAuth.isLoggedIn()) {
        const profile = await LiffAuth.getProfile();
        if (profile) {
          setUser(profile);
        }
      }
    } catch (error) {
      console.error('Failed to initialize LIFF:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      if (!liffReady) {
        throw new Error('LIFF is not ready. Please wait...');
      }

      const profile = await LiffAuth.login();

      // If login() returns null, it means redirection happened
      // Profile will be set after redirect
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    LiffAuth.logout();
    setUser(null);
  };

  const saveUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    liffReady,
    login,
    logout,
    saveUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
