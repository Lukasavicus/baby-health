import type { UIBootstrapPayload } from "./types";

function apiOrigin(): string {
  const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (raw ?? "").replace(/\/$/, "");
}

export const CAREGIVER_STORAGE_KEY = "babyhealth_caregiver_id";

/** Build absolute or same-origin path with optional query params. */
export function buildApiUrl(
  path: string,
  extraParams?: Record<string, string | undefined | null | false>,
): string {
  const origin = apiOrigin();
  const search = new URLSearchParams();
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== null && v !== false && String(v) !== "")
        search.set(k, String(v));
    }
  }
  const q = search.toString();
  const suffix = q ? `?${q}` : "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${p}${suffix}` : `${p}${suffix}`;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${t || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export interface ApiCaregiver {
  id: string;
  name: string;
  role: string;
  avatar_color?: string;
  created_at?: string;
}

export async function listCaregivers(): Promise<ApiCaregiver[]> {
  const res = await fetch(buildApiUrl("/api/caregivers"));
  return parseJsonResponse<ApiCaregiver[]>(res);
}

export interface ApiEvent {
  id: string;
  baby_id: string;
  caregiver_id: string;
  type: string;
  subtype: string;
  timestamp: string;
  end_timestamp: string | null;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EventIncomingPayload {
  baby_id: string;
  caregiver_id: string;
  type: string;
  subtype?: string;
  timestamp?: string;
  end_timestamp?: string | null;
  quantity?: number | null;
  unit?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown>;
}

export async function listEvents(args: {
  baby_id: string;
  date?: string;
  start_date?: string;
  end_date?: string;
  event_type?: string;
}): Promise<ApiEvent[]> {
  const res = await fetch(
    buildApiUrl("/api/events", {
      baby_id: args.baby_id,
      date: args.date,
      start_date: args.start_date,
      end_date: args.end_date,
      event_type: args.event_type,
    }),
  );
  return parseJsonResponse<ApiEvent[]>(res);
}

export async function createEvent(body: EventIncomingPayload): Promise<ApiEvent> {
  const res = await fetch(buildApiUrl("/api/events"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      subtype: body.subtype ?? "",
    }),
  });
  return parseJsonResponse<ApiEvent>(res);
}

export async function updateEvent(
  id: string,
  patch: Partial<EventIncomingPayload>,
): Promise<ApiEvent> {
  const res = await fetch(buildApiUrl(`/api/events/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonResponse<ApiEvent>(res);
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(buildApiUrl(`/api/events/${id}`), { method: "DELETE" });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${t || res.statusText}`);
  }
}

export async function getBabyUiState(babyId: string): Promise<Record<string, unknown>> {
  const res = await fetch(buildApiUrl(`/api/ui/baby-state/${encodeURIComponent(babyId)}`));
  return parseJsonResponse<Record<string, unknown>>(res);
}

export async function putBabyUiState(
  babyId: string,
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(buildApiUrl(`/api/ui/baby-state/${encodeURIComponent(babyId)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonResponse<Record<string, unknown>>(res);
}

/** Absolute or same-origin URL for <img src> (data URL, http(s), or API path). */
export function resolveMediaSrc(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  if (
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  return buildApiUrl(url.startsWith("/") ? url : `/${url}`);
}

const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024;

export async function uploadProfileImage(file: File): Promise<{ url: string }> {
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new Error(`Image too large (max ${MAX_PROFILE_IMAGE_BYTES / (1024 * 1024)} MB).`);
  }
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(buildApiUrl("/api/media/upload"), {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${res.status}: ${t || res.statusText}`);
  }
  return res.json() as Promise<{ url: string }>;
}

export async function updateBaby(
  id: string,
  body: { name?: string; birth_date?: string; photo_url?: string | null },
): Promise<unknown> {
  const res = await fetch(buildApiUrl(`/api/babies/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse(res);
}

export function bootstrapUrl(babyId?: string): string {
  const origin = apiOrigin();
  const path = "/api/ui/bootstrap";
  const params = new URLSearchParams();
  if (babyId) params.set("baby_id", babyId);
  const qs = params.toString();
  const suffix = qs ? `?${qs}` : "";
  return origin ? `${origin}${path}${suffix}` : `${path}${suffix}`;
}

export async function fetchUIBootstrap(babyId?: string): Promise<UIBootstrapPayload> {
  const url = bootstrapUrl(babyId);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bootstrap failed ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<UIBootstrapPayload>;
}
