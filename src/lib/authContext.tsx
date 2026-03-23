"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── All auth calls go through /api/auth/* (same domain) ──────────────────────
// This keeps cookies on econoquest.wahb.space and avoids cross-domain issues
const AUTH_BASE = "/api/auth";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    username?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  getToken: () => Promise<string | null>;
  fetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${AUTH_BASE}/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${AUTH_BASE}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).detail ?? "Login failed");
    }

    const data = await res.json();
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, username?: string) => {
      const res = await fetch(`${AUTH_BASE}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).detail ?? "Registration failed");
      }

      const data = await res.json();
      if (data.user) setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await fetch(`${AUTH_BASE}/google`, { credentials: "include" });
    const data = await res.json();
    window.location.href = data.url;
  }, []);

  const loginWithGithub = useCallback(async () => {
    const res = await fetch(`${AUTH_BASE}/github`, { credentials: "include" });
    const data = await res.json();
    window.location.href = data.url;
  }, []);

  // used by WebSocket to get token for cross-service auth
  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${AUTH_BASE}/token`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.access_token ?? null;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithGithub,
        getToken,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
