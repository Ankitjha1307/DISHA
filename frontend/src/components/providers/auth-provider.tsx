"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch, ApiClientError } from "@/lib/api";
import type { AuthUser } from "@/types/auth";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadSession(): Promise<{
  user: AuthUser | null;
  error: string | null;
}> {
  try {
    const data = await apiFetch<{ user: AuthUser }>("/api/auth/me");
    return { user: data.user, error: null };
  } catch (requestError) {
    if (requestError instanceof ApiClientError) {
      if (requestError.status === 401) {
        return { user: null, error: null };
      }

      return { user: null, error: requestError.message };
    }

    return { user: null, error: "Unable to load your session." };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void loadSession().then((session) => {
      if (cancelled) {
        return;
      }

      setUser(session.user);
      setError(session.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const session = await loadSession();
    setUser(session.user);
    setError(session.error);
    setLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const data = await apiFetch<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });

    setUser(data.user);
    setError(null);
    return data.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const data = await apiFetch<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });

    setUser(data.user);
    setError(null);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch<{ message: string }>("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, refresh }),
    [user, loading, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
