import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi } from "../services/api";

const AuthContext = createContext(null);
const SESSION_KEY = "aurelia_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  async function register(payload) {
    const result = await authApi.register(payload);
    setUser(result.user);
    return result.user;
  }

  async function login(payload) {
    const result = await authApi.login(payload);
    setUser(result.user);
    return result.user;
  }

  async function refreshProfile() {
    if (!user?.id) return null;
    const profile = await userApi.profile(user.id);
    setUser(profile);
    return profile;
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      setUser,
      refreshProfile
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
