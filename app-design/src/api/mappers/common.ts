import type { ApiEvent, EventIncomingPayload } from "../client";

/** Backend event ids are 32-char hex (uuid4().hex). */
export function isApiEventId(id: string): boolean {
  return /^[a-f0-9]{32}$/i.test(id);
}

export function formatYmd(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Local wall-clock ISO without timezone suffix (matches FastAPI naive parsing). */
export function combineDayAndTime(dayYmd: string, hhmm: string): string {
  const parts = (hhmm || "12:00").split(":");
  const hh = parseInt(parts[0] || "12", 10) || 0;
  const mm = parseInt(parts[1] || "0", 10) || 0;
  const [y, mo, d] = dayYmd.split("-").map((x) => parseInt(x, 10));
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${y}-${pad(mo)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
}

export function timeFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export function caregiverName(id: string, map: Map<string, string>): string {
  return map.get(id) || "—";
}

function tsFromEntry(entry: { time?: string; timestamp?: Date }, dayYmd: string): string {
  if (entry.time && /^\d{1,2}:\d{2}/.test(entry.time)) {
    const normalized = entry.time.length <= 5 ? entry.time.padStart(5, "0") : entry.time.slice(0, 5);
    return combineDayAndTime(dayYmd, normalized);
  }
  if (entry.timestamp instanceof Date) {
    return combineDayAndTime(dayYmd, `${entry.timestamp.getHours()}:${entry.timestamp.getMinutes()}`);
  }
  return combineDayAndTime(dayYmd, "12:00");
}

/** LogSheet / Today quick log entry → API create body. */
export function logSheetEntryToIncoming(
  entry: Record<string, unknown>,
  babyId: string,
  caregiverId: string,
  dayYmd: string,
): EventIncomingPayload {
  const type = String(entry.type || "");
  const notes = entry.notes != null ? String(entry.notes) : undefined;
  const base: EventIncomingPayload = {
    baby_id: babyId,
    caregiver_id: caregiverId,
    type,
    notes: notes || undefined,
    metadata: {},
  };

  switch (type) {
    case "feeding": {
      const sub = String(entry.subType || entry.sub_type || "breast");
      const md: Record<string, unknown> = {};
      if (entry.feedSide) md.breast_side = entry.feedSide;
      if (typeof entry.duration === "number") md.duration_min = entry.duration;
      if (entry.formulaBrand) md.formula_brand = entry.formulaBrand;
      const qty = entry.quantity != null ? Number(entry.quantity) : undefined;
      return {
        ...base,
        subtype: sub === "formula" ? "bottle" : sub,
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        quantity: sub === "bottle" || sub === "formula" ? qty : undefined,
        unit: sub === "bottle" || sub === "formula" ? "ml" : undefined,
        metadata: md,
      };
    }
    case "hydration": {
      const sub = String(entry.subType || "water");
      return {
        ...base,
        subtype: sub,
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        quantity: entry.quantity != null ? Number(entry.quantity) : undefined,
        unit: "ml",
        metadata: {},
      };
    }
    case "sleep": {
      const sub = String(entry.subType || "nap");
      const ss = entry.sleepStart as string | undefined;
      const se = entry.sleepEnd as string | undefined;
      const loc = entry.sleepLocation as string | undefined;
      if (ss && se) {
        return {
          ...base,
          type: "sleep",
          subtype: sub === "night" ? "night" : "nap",
          timestamp: combineDayAndTime(dayYmd, ss),
          end_timestamp: combineDayAndTime(dayYmd, se),
          metadata: loc ? { sleep_location: loc } : {},
        };
      }
      return {
        ...base,
        type: "sleep",
        subtype: sub === "night" ? "night" : "nap",
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        metadata: loc ? { sleep_location: loc } : {},
      };
    }
    case "diaper": {
      const sub = String(entry.subType || "pee");
      const md: Record<string, unknown> = {};
      if (entry.peeVolume != null) md.pee_volume = entry.peeVolume;
      if (entry.pooVolume != null) md.poo_volume = entry.pooVolume;
      return {
        ...base,
        subtype: sub,
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        metadata: md,
      };
    }
    case "bath": {
      const sub = String(entry.subType || "morno");
      const dur = entry.duration != null ? Number(entry.duration) : undefined;
      return {
        ...base,
        subtype: sub,
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        quantity: dur,
        unit: "min",
        metadata: {},
      };
    }
    case "activity": {
      const sub = String(entry.subType || "play");
      const dur = entry.duration != null ? Number(entry.duration) : undefined;
      return {
        ...base,
        subtype: sub,
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        quantity: dur,
        unit: dur != null ? "min" : undefined,
        metadata: {},
      };
    }
    case "health": {
      const sub = String(entry.subType || "vitamin");
      const md: Record<string, unknown> = {};
      if (entry.healthName) md.health_name = entry.healthName;
      if (entry.healthDosage) md.health_dosage = entry.healthDosage;
      return {
        ...base,
        subtype: sub,
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
        metadata: md,
      };
    }
    default:
      return {
        ...base,
        subtype: "",
        timestamp: tsFromEntry(entry as { time?: string; timestamp?: Date }, dayYmd),
      };
  }
}

/** Short weekday labels (dom … sáb) aligned with week* aggregators (index 0 = 6 days ago). */
export function weekDayLabelsPt(referenceDate = new Date()): string[] {
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    labels.push(
      d
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", "")
        .slice(0, 3),
    );
  }
  return labels;
}

export function weekCountsByDay(
  events: ApiEvent[],
  dayLabels: string[],
  referenceDate: Date,
): { day: string; count: number }[] {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const byIndex = new Map<number, number>();
  for (const ev of events) {
    const d = new Date(ev.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      byIndex.set(diff, (byIndex.get(diff) || 0) + 1);
    }
  }

  return dayLabels.map((label, i) => ({
    day: label,
    count: byIndex.get(i) || 0,
  }));
}

export function weekCountsByDayForType(
  events: ApiEvent[],
  dayLabels: string[],
  referenceDate: Date,
  eventType: string,
): { day: string; count: number }[] {
  const start = new Date(referenceDate);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const byIndex = new Map<number, number>();
  for (const ev of events) {
    if (ev.type !== eventType) continue;
    const d = new Date(ev.timestamp);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - start.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) {
      byIndex.set(diff, (byIndex.get(diff) || 0) + 1);
    }
  }

  return dayLabels.map((label, i) => ({
    day: label,
    count: byIndex.get(i) || 0,
  }));
}

/** Parse pt-BR style time from `toLocaleTimeString` into HH:mm for combineDayAndTime. */
export function localeTimeStringToHhMm(localeTime: string): string {
  const t = localeTime.replace(/\./g, ":").trim();
  const m = t.match(/(\d{1,2})\D*(\d{2})/);
  if (!m) return "12:00";
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}
