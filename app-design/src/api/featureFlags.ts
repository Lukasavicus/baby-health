import { authHeaders, buildApiUrl } from "./client";

export type FeatureCatalogItem = {
  key: string;
  variants: string[];
  defaultVariant: string;
  description?: string | null;
};

/** Public catalog: keys and allowed variants (no per-profile data). */
export async function fetchFeatureFlagCatalog(): Promise<FeatureCatalogItem[]> {
  const r = await fetch(buildApiUrl("/api/feature-flags/catalog"));
  if (!r.ok) throw new Error(`feature-flags catalog ${r.status}`);
  const j = (await r.json()) as { features?: FeatureCatalogItem[] };
  return j.features ?? [];
}

/** Effective assignments for the logged-in user's profile_dir (JWT). */
export async function fetchMyFeatureFlags(): Promise<Record<string, string>> {
  const r = await fetch(buildApiUrl("/api/feature-flags/me"), { headers: authHeaders() });
  if (!r.ok) throw new Error(`feature-flags me ${r.status}`);
  const j = (await r.json()) as { assignments?: Record<string, string> };
  return j.assignments ?? {};
}
