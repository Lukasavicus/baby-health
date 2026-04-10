import type { ApiEvent, EventIncomingPayload } from "../client";
import { combineDayAndTime, timeFromIso } from "./common";

export function apiEventToDiaperEntry(ev: ApiEvent): {
  id: string;
  type: string;
  time: string;
  peeVolume: number;
  pooVolume: number;
  notes: string;
} {
  let t = ev.subtype;
  if (t === "wet") t = "pee";
  if (t === "dirty") t = "poo";
  if (t === "mixed") t = "mixed";
  const md = ev.metadata as { pee_volume?: number; poo_volume?: number };
  return {
    id: ev.id,
    type: t,
    time: timeFromIso(ev.timestamp),
    peeVolume: Number(md?.pee_volume ?? 2),
    pooVolume: Number(md?.poo_volume ?? 2),
    notes: ev.notes || "",
  };
}

export function diaperEntryToIncoming(
  e: { type: string; time: string; peeVolume: number; pooVolume: number; notes: string },
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  const sub = e.type === "mixed" ? "mixed" : e.type;
  return {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type: "diaper",
    subtype: sub,
    timestamp: combineDayAndTime(dayYmd, e.time),
    notes: e.notes || undefined,
    metadata: { pee_volume: e.peeVolume, poo_volume: e.pooVolume },
  };
}

/** Stacked week chart: wet = wet+mixed, dirty = dirty+mixed (counts per day). */
export function weekDiaperWetDirtyByDay(
  events: ApiEvent[],
  dayLabels: string[],
  referenceDate: Date,
): { day: string; wet: number; dirty: number }[] {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const wetBy = new Map<number, number>();
  const dirtyBy = new Map<number, number>();
  for (const ev of events) {
    if (ev.type !== "diaper") continue;
    const d = new Date(ev.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (diff < 0 || diff >= 7) continue;
    const sub = ev.subtype;
    if (sub === "wet" || sub === "mixed") {
      wetBy.set(diff, (wetBy.get(diff) || 0) + 1);
    }
    if (sub === "dirty" || sub === "mixed") {
      dirtyBy.set(diff, (dirtyBy.get(diff) || 0) + 1);
    }
  }

  return dayLabels.map((label, i) => ({
    day: label,
    wet: wetBy.get(i) || 0,
    dirty: dirtyBy.get(i) || 0,
  }));
}
