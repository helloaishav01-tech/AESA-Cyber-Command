import { createContext, useContext, useState, useEffect } from "react";
import api, { formatApiError } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: formatApiError(error) };
    }
  }

  async function register(email, password, name) {
    try {
      const { data } = await api.post("/api/auth/register", { email, password, name });
      setUser(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: formatApiError(error) };
    }
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
