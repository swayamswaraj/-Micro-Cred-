// src/contexts/AuthContext.tsx (FINAL)
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "employer";
  employerId?: string;
  organization?: string;
  post?: string;
  [key: string]: any;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  // FIX: signUp now returns a success status/response object
  signUp: (data: Record<string, any>) => Promise<any>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshProfile();
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    await api.post("/auth/login", { email, password });
    await refreshProfile();
  };

  // FIX: Stop auto-login/refresh after registration
  const signUp = async (data: Record<string, any>) => {
    const res = await api.post("/auth/register", data);
    // DO NOT CALL refreshProfile() here. Force redirect to login.
    return res.data;
  };

  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Logout request failed:", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
