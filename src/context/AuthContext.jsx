import { createContext, useContext, useState } from 'react';

const API = 'http://localhost:4000';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Calls POST /login on the Express server.
  // Returns { ok: true } or { ok: false, error: string }.
  // credentials: 'include' tells the browser to send/receive cookies cross-origin.
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
    return { ok: true };
  };

  const logout = async () => {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = { isLoggedIn, user, login, logout };

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