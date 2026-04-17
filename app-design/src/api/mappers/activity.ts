import type { ApiEvent, EventIncomingPayload } from "../client";
import { combineDayAndTime, timeFromIso } from "./common";

export function apiEventToActivityEntry(ev: ApiEvent): {
  id: string;
  time: string;
  type: string;
  duration: number;
  notes: string;
} {
  let sub = ev.subtype;
  if (sub === "tummy_time") sub = "tummy";
  return {
    id: ev.id,
    time: timeFromIso(ev.timestamp),
    type: sub,
    duration: Number(ev.quantity ?? 15),
    notes: ev.notes || "",
  };
}

export function activityEntryToIncoming(
  e: { time: string; type: string; duration: number; notes: string },
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  return {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type: "activity",
    subtype: e.type,
    timestamp: combineDayAndTime(dayYmd, e.time),
    quantity: e.duration,
    unit: "min",
    notes: e.notes || undefined,
    metadata: {},
  };
}

export function apiEventToActivityEntryV2(
  ev: ApiEvent,
  labelMap: Record<string, string>,
): { id: string; time: string; type: string; label: string; duration: number; notes: string } {
  return {
    id: ev.id,
    time: timeFromIso(ev.timestamp),
    type: ev.subtype,
    label: labelMap[ev.subtype] || ev.subtype,
    duration: Number(ev.quantity ?? 15),
    notes: ev.notes || "",
  };
}

/** Aggregate activity events by weekday (last 7 days) → minutes per day. */
export function weekMinutesByDay(
  events: ApiEvent[],
  dayLabels: string[],
  referenceDate: Date,
): { day: string; min: number }[] {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const byIndex = new Map<number, number>();
  for (const ev of events) {
    if (ev.type !== "activity") continue;
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
    min: Math.round(byIndex.get(i) || 0),
  }));
}
