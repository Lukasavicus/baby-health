/** Milestone catalog (static seed) vs progress persisted in baby_ui_state.milestones */

export type MilestoneStatus = "observed" | "emerging" | "not_yet";

export interface MilestoneCatalogRow {
  id: string;
  title: string;
  description: string;
  ageRange: string;
  category: string;
  /** User-created entry (persisted under baby_ui_state.custom_milestones). */
  isCustom?: boolean;
}

export interface MilestoneProgressRow {
  id: string;
  status: MilestoneStatus;
  observedDate?: string;
  notes?: string;
}

export interface MergedMilestone extends MilestoneCatalogRow {
  status: MilestoneStatus;
  observedDate?: string;
  notes?: string;
}

function isMilestoneStatus(s: unknown): s is MilestoneStatus {
  return s === "observed" || s === "emerging" || s === "not_yet";
}

/** Normalize static catalog: ignore any status/date/notes bundled in seed JSON. */
export function catalogFromSeed(raw: unknown[]): MilestoneCatalogRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
    .map((x) => ({
      id: String(x.id ?? ""),
      title: String(x.title ?? ""),
      description: String(x.description ?? ""),
      ageRange: String(x.ageRange ?? ""),
      category: String(x.category ?? ""),
      isCustom: false,
    }))
    .filter((r) => r.id.length > 0);
}

/** Parse baby_ui_state.custom_milestones (user-defined catalog rows). */
export function catalogFromCustomStored(raw: unknown[] | undefined): MilestoneCatalogRow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => x != null && typeof x === "object")
    .map((x) => ({
      id: String(x.id ?? ""),
      title: String(x.title ?? "").trim(),
      description: String(x.description ?? "").trim(),
      ageRange: String(x.ageRange ?? "").trim(),
      category: String(x.category ?? "cognitive").trim() || "cognitive",
      isCustom: true,
    }))
    .filter((r) => r.id.length > 0 && r.title.length > 0 && r.ageRange.length > 0);
}

/** Snapshot progress from merged list (e.g. before adding a catalog row). */
export function progressMapFromMerged(merged: MergedMilestone[]): Map<string, MilestoneProgressRow> {
  const map = new Map<string, MilestoneProgressRow>();
  for (const m of merged) {
    map.set(m.id, {
      id: m.id,
      status: m.status,
      observedDate: m.observedDate,
      notes: m.notes,
    });
  }
  return map;
}

/**
 * Parse baby_ui_state.milestones: either slim { id, status, ... } or legacy full objects with title.
 */
export function progressMapFromStored(stored: unknown[] | undefined): Map<string, MilestoneProgressRow> {
  const map = new Map<string, MilestoneProgressRow>();
  if (!Array.isArray(stored)) return map;
  for (const item of stored) {
    if (item == null || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const id = String(o.id ?? "");
    if (!id) continue;
    const status = isMilestoneStatus(o.status) ? o.status : "not_yet";
    const observedDate = typeof o.observedDate === "string" ? o.observedDate : undefined;
    const notes = typeof o.notes === "string" ? o.notes : undefined;
    map.set(id, { id, status, observedDate, notes });
  }
  return map;
}

export function mergeMilestones(
  catalog: MilestoneCatalogRow[],
  progress: Map<string, MilestoneProgressRow>,
): MergedMilestone[] {
  return catalog.map((c) => {
    const p = progress.get(c.id);
    return {
      ...c,
      isCustom: c.isCustom === true,
      status: p?.status ?? "not_yet",
      observedDate: p?.observedDate,
      notes: p?.notes,
    };
  });
}

/** Serialize merged list for API: only id + markings (no title/description). */
export function toPersistedProgress(merged: MergedMilestone[]): MilestoneProgressRow[] {
  return merged.map((m) => {
    const row: MilestoneProgressRow = {
      id: m.id,
      status: m.status,
    };
    if (m.observedDate) row.observedDate = m.observedDate;
    if (m.notes) row.notes = m.notes;
    return row;
  });
}

/** Payload for baby_ui_state.custom_milestones (no isCustom flag). */
export function toPersistedCustomCatalog(
  rows: MilestoneCatalogRow[],
): Array<{ id: string; title: string; description: string; ageRange: string; category: string }> {
  return rows
    .filter((r) => r.isCustom === true)
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      ageRange: r.ageRange,
      category: r.category,
    }));
}
