import { createContext, useContext, useState } from 'react';

const API = 'http://localhost:4000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  const login = async (email, password) => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { ok: false, error: data.error };
    }

    const data = await res.json();
    setIsLoggedIn(true);
    setUser(data.email);

    // Session cookie is now set. Fetch the CSRF token while we're here —
    // the server ties it to this session, so we must be logged in first.
    const tokenRes = await fetch(`${API}/csrf-token`, { credentials: 'include' });
    const tokenData = await tokenRes.json();
    setCsrfToken(tokenData.csrfToken);

    return { ok: true };
  };

  const logout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setUser(null);
    setCsrfToken(null);
  };

  const value = { isLoggedIn, user, csrfToken, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}