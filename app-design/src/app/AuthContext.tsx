import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const TOKEN_KEY = "babyhealth_token";

interface UserInfo {
  id: string;
  username: string;
  display_name: string;
  profile_dir: string;
  caregiver_id: string;
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

function decodePayload(token: string): UserInfo | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.sub,
      username: payload.username,
      display_name: payload.username,
      profile_dir: payload.profile_dir,
      caregiver_id: payload.caregiver_id,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const info = decodePayload(stored);
      if (info) {
        setToken(stored);
        setUser(info);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const origin = (import.meta.env.VITE_API_BASE_URL as string | undefined ?? "").replace(/\/$/, "");
    const url = origin ? `${origin}/api/auth/login` : "/api/auth/login";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ?? "Login failed");
    }
    const data = await res.json();
    const t = data.access_token as string;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      logout,
    }),
    [token, user, loading, login, logout],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
