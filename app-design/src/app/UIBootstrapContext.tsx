import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CAREGIVER_STORAGE_KEY,
  fetchUIBootstrap,
  listCaregivers,
  type ApiCaregiver,
} from "@/api/client";
import type { UIBootstrapPayload } from "@/api/types";
import { fetchMyFeatureFlags } from "@/api/featureFlags";
import { useAuth } from "./AuthContext";

interface UIBootstrapState {
  data: UIBootstrapPayload | null;
  loading: boolean;
  error: Error | null;
  refetch: (babyId?: string) => Promise<void>;
  /** Last resolved baby id from payload (after fetch). */
  babyId: string | null;
  caregiverId: string | null;
  setCaregiverId: (id: string) => void;
  caregivers: ApiCaregiver[];
  /** True when baby has id and we have a caregiver (API persistence ready). */
  canPersist: boolean;
  /** Effective feature flag assignments for JWT profile_dir (empty if API off or error). */
  featureAssignments: Record<string, string>;
}

const Ctx = createContext<UIBootstrapState | null>(null);

export function UIBootstrapProvider({
  children,
  initialBabyId,
}: {
  children: ReactNode;
  initialBabyId?: string;
}) {
  const [data, setData] = useState<UIBootstrapPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [babyId, setBabyId] = useState<string | null>(null);
  const [caregivers, setCaregivers] = useState<ApiCaregiver[]>([]);
  const [caregiverId, setCaregiverIdState] = useState<string | null>(null);
  const [featureAssignments, setFeatureAssignments] = useState<Record<string, string>>({});

  const setCaregiverId = useCallback((id: string) => {
    setCaregiverIdState(id);
    try {
      localStorage.setItem(CAREGIVER_STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const { logout, user: authUser, isAuthenticated } = useAuth();

  const refetch = useCallback(async (bid?: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchUIBootstrap(bid ?? initialBabyId);
      setData(payload);
      const rawId = payload.baby?.id;
      setBabyId(
        rawId != null && String(rawId).trim() !== "" ? String(rawId).trim() : null,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("401") || msg.includes("Session expired")) {
        logout();
        return;
      }
      setError(e instanceof Error ? e : new Error(msg));
      setData(null);
      setBabyId(null);
    } finally {
      setLoading(false);
    }
  }, [initialBabyId, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void refetch(initialBabyId);
  }, [initialBabyId, refetch, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFeatureAssignments({});
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const a = await fetchMyFeatureFlags();
        if (!cancelled) setFeatureAssignments(a);
      } catch {
        if (!cancelled) setFeatureAssignments({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!babyId) {
      setCaregivers([]);
      setCaregiverIdState(null);
      return;
    }
    void (async () => {
      try {
        const list = await listCaregivers();
        setCaregivers(list);

        const tokenCgId = authUser?.caregiver_id;
        if (tokenCgId && list.some((c) => c.id === tokenCgId)) {
          setCaregiverIdState(tokenCgId);
        } else {
          let stored: string | null = null;
          try {
            stored = localStorage.getItem(CAREGIVER_STORAGE_KEY);
          } catch {
            stored = null;
          }
          if (stored && list.some((c) => c.id === stored)) {
            setCaregiverIdState(stored);
          } else if (list[0]) {
            setCaregiverIdState(list[0].id);
          } else {
            setCaregiverIdState(null);
          }
        }
      } catch {
        setCaregivers([]);
        setCaregiverIdState(null);
      }
    })();
  }, [babyId, authUser?.caregiver_id]);

  const canPersist = Boolean(babyId && caregiverId);

  const value = useMemo(
    () => ({
      data,
      loading,
      error,
      refetch,
      babyId,
      caregiverId,
      setCaregiverId,
      caregivers,
      canPersist,
      featureAssignments,
    }),
    [
      data,
      loading,
      error,
      refetch,
      babyId,
      caregiverId,
      setCaregiverId,
      caregivers,
      canPersist,
      featureAssignments,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useUIBootstrap(): UIBootstrapState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useUIBootstrap must be used within UIBootstrapProvider");
  return v;
}

/** Safe variant for optional usage outside provider (returns null). */
export function useUIBootstrapOptional(): UIBootstrapState | null {
  return useContext(Ctx);
}
