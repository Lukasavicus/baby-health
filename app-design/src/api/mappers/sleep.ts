import type { ApiEvent, EventIncomingPayload } from "../client";
import { combineDayAndTime, timeFromIso } from "./common";

export function apiEventToSleepEntry(ev: ApiEvent): {
  id: string;
  type: "night" | "nap";
  typeLabel: string;
  start: string;
  end: string;
  location: string;
  notes: string;
} {
  const sub = ev.subtype === "night_sleep" ? "night" : "nap";
  const start = timeFromIso(ev.timestamp);
  const end = ev.end_timestamp ? timeFromIso(ev.end_timestamp) : start;
  const loc = String((ev.metadata as { sleep_location?: string })?.sleep_location || "");
  return {
    id: ev.id,
    type: sub,
    typeLabel: sub === "night" ? "Noturno" : "Cochilo",
    start,
    end,
    location: loc,
    notes: ev.notes || "",
  };
}

export function sleepEntryToIncoming(
  e: {
    type: "night" | "nap";
    start: string;
    end: string;
    location: string;
    notes: string;
  },
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  return {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type: "sleep",
    subtype: e.type === "night" ? "night" : "nap",
    timestamp: combineDayAndTime(dayYmd, e.start),
    end_timestamp: combineDayAndTime(dayYmd, e.end),
    notes: e.notes || undefined,
    metadata: e.location ? { sleep_location: e.location } : {},
  };
}

/** Aggregate sleep events by weekday (last 7 days) → hours per day. */
export function weekHoursByDay(
  events: ApiEvent[],
  dayLabels: string[],
  referenceDate: Date,
): { day: string; hours: number }[] {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const byIndex = new Map<number, number>();
  for (const ev of events) {
    if (ev.type !== "sleep" || !ev.end_timestamp) continue;
    const t0 = new Date(ev.timestamp).getTime();
    const t1 = new Date(ev.end_timestamp).getTime();
    if (t1 <= t0) continue;
    const hours = (t1 - t0) / 3600000;
    const d = new Date(ev.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      byIndex.set(diff, (byIndex.get(diff) || 0) + hours);
    }
  }

  return dayLabels.map((label, i) => ({
    day: label,
    hours: Math.round((byIndex.get(i) || 0) * 10) / 10,
  }));
}
