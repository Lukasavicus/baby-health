import type { ApiEvent, EventIncomingPayload } from "../client";
import { combineDayAndTime, timeFromIso } from "./common";

export function apiEventToHydrationEntry(ev: ApiEvent): {
  id: string;
  type: string;
  time: string;
  amount: number;
  notes: string;
} {
  const drink = (ev.metadata as { drink_type?: string })?.drink_type;
  const t = ev.subtype === "other" && drink === "tea" ? "tea" : ev.subtype || "water";
  return {
    id: ev.id,
    type: t,
    time: timeFromIso(ev.timestamp),
    amount: ev.quantity ?? 0,
    notes: ev.notes || "",
  };
}

export function hydrationEntryToIncoming(
  e: { type: string; time: string; amount: number; notes: string },
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  return {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type: "hydration",
    subtype: e.type,
    timestamp: combineDayAndTime(dayYmd, e.time),
    quantity: e.amount,
    unit: "ml",
    notes: e.notes || undefined,
    metadata: {},
  };
}

/** Aggregate hydration events by weekday (last 7 days) → ml per day. */
export function weekMlByDay(
  events: ApiEvent[],
  dayLabels: string[],
  referenceDate: Date,
): { day: string; ml: number }[] {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const byIndex = new Map<number, number>();
  for (const ev of events) {
    if (ev.type !== "hydration") continue;
    const q = ev.quantity;
    if (q == null) continue;
    const d = new Date(ev.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      byIndex.set(diff, (byIndex.get(diff) || 0) + Number(q));
    }
  }

  return dayLabels.map((label, i) => ({
    day: label,
    ml: Math.round(byIndex.get(i) || 0),
  }));
}
