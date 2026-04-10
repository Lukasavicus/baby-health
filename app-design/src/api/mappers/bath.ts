import type { ApiEvent, EventIncomingPayload } from "../client";
import { combineDayAndTime, timeFromIso } from "./common";

export function apiEventToBathEntry(ev: ApiEvent): {
  id: string;
  time: string;
  temp: string;
  duration: number;
  notes: string;
} {
  const md = ev.metadata as { bath_temperature?: string; duration_min?: number };
  const temp = md?.bath_temperature || "morno";
  const dur = md?.duration_min ?? ev.quantity ?? 15;
  return {
    id: ev.id,
    time: timeFromIso(ev.timestamp),
    temp,
    duration: Number(dur),
    notes: ev.notes || "",
  };
}

export function bathEntryToIncoming(
  e: { time: string; temp: string; duration: number; notes: string },
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  return {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type: "bath",
    subtype: e.temp,
    timestamp: combineDayAndTime(dayYmd, e.time),
    quantity: e.duration,
    unit: "min",
    notes: e.notes || undefined,
    metadata: { bath_temperature: e.temp, duration_min: e.duration },
  };
}
