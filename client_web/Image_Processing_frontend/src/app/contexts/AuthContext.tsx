import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, AuthSession } from "../lib/api";

const STORAGE_KEY = "visionix-auth-session";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
  setSession: (session: AuthSession | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved) as AuthSession;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      if (!session?.token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        await api.me(session.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        if (!cancelled) {
          setSessionState(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    validate();

    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  const setSession = (nextSession: AuthSession | null) => {
    setSessionState(nextSession);

    if (nextSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  };

  const logout = async () => {
    if (session?.token) {
      try {
        await api.logout(session.token);
      } catch {
        // no-op: clear local session anyway
      }
    }

    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      loading,
      isAuthenticated: Boolean(session?.token),
      setSession,
      logout,
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
