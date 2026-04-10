import type { ApiEvent, EventIncomingPayload } from "../client";
import { combineDayAndTime, timeFromIso } from "./common";

/** Map API event → FeedingDetailPage entry (duration/amount as UI strings). */
export function apiEventToFeedingEntry(
  ev: ApiEvent,
  feedingTypes: { id: string; label: string }[],
): {
  id: string;
  time: string;
  type: "breast" | "formula" | "solids";
  typeLabel: string;
  side?: string;
  duration?: string;
  amount?: string;
  notes?: string;
  food?: null;
  foodName?: string;
  formulaBrand?: string;
} {
  const md = ev.metadata as {
    breast_side?: string;
    formula_brand?: string;
    duration_min?: number;
    food_name?: string;
  };
  let type: "breast" | "formula" | "solids" = "breast";
  if (ev.subtype === "solids") type = "solids";
  else if (ev.subtype === "bottle_breastmilk" || ev.subtype === "bottle_formula" || ev.subtype === "bottle") type = "formula";

  const brand = type === "formula"
    ? (md?.formula_brand || (ev.subtype === "bottle_breastmilk" ? "Mamadeira" : ""))
    : undefined;

  const typeLabel = feedingTypes.find((f) => f.id === type)?.label || "";
  const durMin = md?.duration_min ?? 10;
  const amt = ev.quantity ?? (type === "solids" ? 50 : 120);

  return {
    id: ev.id,
    time: timeFromIso(ev.timestamp),
    type,
    typeLabel,
    side: type === "breast" ? md?.breast_side || "" : undefined,
    duration: type === "breast" ? `${durMin} min` : undefined,
    amount: type !== "breast" ? `${amt} ${type === "solids" ? "g" : "ml"}` : undefined,
    notes: ev.notes || "",
    food: null,
    foodName: type === "solids" && md?.food_name ? md.food_name : undefined,
    formulaBrand: brand,
  };
}

export function feedingEntryToIncoming(
  e: {
    type: string;
    time: string;
    side?: string;
    duration: number;
    amount: number;
    formula?: string;
    notes: string;
    foodName?: string | null;
  },
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  const md: Record<string, unknown> = {};
  if (e.side) md.breast_side = e.side;
  if (e.duration) md.duration_min = e.duration;
  if (e.formula) md.formula_brand = e.formula;
  if (e.foodName) md.food_name = e.foodName;

  if (e.type === "breast") {
    return {
      baby_id: babyId,
      caregiver_id: caregiverId,
      type: "feeding",
      subtype: "breast",
      timestamp: combineDayAndTime(dayYmd, e.time),
      metadata: md,
      notes: e.notes || undefined,
    };
  }
  if (e.type === "formula") {
    return {
      baby_id: babyId,
      caregiver_id: caregiverId,
      type: "feeding",
      subtype: "bottle",
      timestamp: combineDayAndTime(dayYmd, e.time),
      quantity: e.amount,
      unit: "ml",
      metadata: md,
      notes: e.notes || undefined,
    };
  }
  return {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type: "feeding",
    subtype: "solids",
    timestamp: combineDayAndTime(dayYmd, e.time),
    quantity: e.amount,
    unit: "g",
    metadata: md,
    notes: e.notes || undefined,
  };
}
