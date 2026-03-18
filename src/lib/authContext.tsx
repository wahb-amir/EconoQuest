"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode
} from "react";

const AUTH_SERVICE = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!;

interface User {
  id:       string;
  email:    string;
  username: string;
}

interface AuthContextType {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:           (email: string, password: string) => Promise<void>;
  register:        (email: string, password: string, username?: string) => Promise<void>;
  logout:          () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // check session on mount
  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${AUTH_SERVICE}/auth/me`, {
        credentials: "include",  // send cookies
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
    const res = await fetch(`${AUTH_SERVICE}/auth/login`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Login failed");
    }

    const data = await res.json();
    setUser(data.user);
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    username?: string
  ) => {
    const res = await fetch(`${AUTH_SERVICE}/auth/register`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ email, password, username }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail ?? "Registration failed");
    }

    const data = await res.json();
    if (data.user) setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${AUTH_SERVICE}/auth/logout`, {
      method:      "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await fetch(`${AUTH_SERVICE}/auth/google`, {
      credentials: "include"
    });
    const { url } = await res.json();
    window.location.href = url;
  }, []);

  const loginWithGithub = useCallback(async () => {
    const res = await fetch(`${AUTH_SERVICE}/auth/github`, {
      credentials: "include"
    });
    const { url } = await res.json();
    window.location.href = url;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loginWithGoogle,
      loginWithGithub,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}