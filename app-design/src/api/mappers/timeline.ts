import type { ApiEvent } from "../client";
import { timeFromIso, caregiverName } from "./common";

export interface TimelineRow {
  id?: string;
  type: string;
  subType?: string;
  quantity?: number;
  notes?: string;
  time: string;
  caregiver: string;
}

/** Map stored event → Today timeline row. */
export function apiEventToTimelineRow(ev: ApiEvent, caregiverNames: Map<string, string>): TimelineRow {
  const md = ev.metadata || {};
  let subType = ev.subtype;
  if (ev.type === "feeding") {
    if (ev.subtype === "breastfeeding") subType = "breast";
    if (ev.subtype === "bottle_formula" || ev.subtype === "bottle_breastmilk") subType = "bottle";
    if (ev.subtype === "solids") subType = "solids";
  }
  if (ev.type === "hydration" && md.drink_type === "tea") subType = "tea";

  const row: TimelineRow = {
    id: ev.id,
    type: ev.type,
    subType,
    quantity: ev.quantity ?? undefined,
    notes: ev.notes ?? undefined,
    time: timeFromIso(ev.timestamp),
    caregiver: caregiverName(ev.caregiver_id, caregiverNames),
  };

  if (ev.type === "sleep" && ev.end_timestamp) {
    row.notes = [row.notes, `até ${timeFromIso(ev.end_timestamp)}`].filter(Boolean).join(" · ");
  }

  return row;
}
