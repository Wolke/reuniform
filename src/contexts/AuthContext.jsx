import { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    // 從 localStorage 恢復使用者資訊
    const storedUser = localStorage.getItem('line_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('line_user');
      }
    }
    setLoading(false);
  }, []);

  const login = () => {
    const channelId = import.meta.env.VITE_LINE_CHANNEL_ID;
    const callbackUrl = import.meta.env.VITE_LINE_CALLBACK_URL;
    const state = generateRandomState();
    const nonce = generateRandomNonce();

    // 儲存 state 和 nonce 用於驗證
    sessionStorage.setItem('line_state', state);
    sessionStorage.setItem('line_nonce', nonce);

    // 建構 LINE Login URL
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.set('response_type', 'code');
    lineAuthUrl.searchParams.set('client_id', channelId);
    lineAuthUrl.searchParams.set('redirect_uri', callbackUrl);
    lineAuthUrl.searchParams.set('state', state);
    lineAuthUrl.searchParams.set('scope', 'profile openid');
    lineAuthUrl.searchParams.set('nonce', nonce);

    // 導向 LINE Login
    window.location.href = lineAuthUrl.toString();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('line_user');
    sessionStorage.removeItem('line_state');
    sessionStorage.removeItem('line_nonce');
  };

  const saveUser = (userData) => {
    setUser(userData);
    localStorage.setItem('line_user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    saveUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Helper functions
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateRandomNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
