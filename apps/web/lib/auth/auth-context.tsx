"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, setToken, clearToken, ApiError } from "../api";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasStoredToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasStoredToken);
  const router = useRouter();

  useEffect(() => {
    if (!hasStoredToken()) return;

    api
      .get<{ userId: string; email: string; role: string }>("/auth/me")
      .then((data) => {
        setUser({ id: data.userId, email: data.email, name: null, role: data.role });
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<AuthResponse>("/auth/login", { email, password });
    setToken(data.accessToken);
    setUser(data.user);
    router.push("/dashboard");
  }

  async function register(email: string, password: string, name?: string) {
    const data = await api.post<AuthResponse>("/auth/register", { email, password, name });
    setToken(data.accessToken);
    setUser(data.user);
    router.push("/dashboard");
  }

  function logout() {
    clearToken();
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
