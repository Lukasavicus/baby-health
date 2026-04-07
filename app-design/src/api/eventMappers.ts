import type { ApiEvent, EventIncomingPayload } from "./client";

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

export interface TimelineRow {
  id?: string;
  type: string;
  subType?: string;
  quantity?: number;
  notes?: string;
  time: string;
  caregiver: string;
}

function timeFromIso(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function caregiverName(id: string, map: Map<string, string>): string {
  return map.get(id) || "—";
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

/** --- Detail pages: API ↔ local entry shapes --- */

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

/** Map API event → FeedingDetailPage entry (duration/amount as UI strings). */
export function apiEventToFeedingEntry(
  ev: ApiEvent,
  feedingTypes: { id: string; label: string }[],
): {
  id: string;
  time: string;
  type: "breast" | "bottle" | "formula" | "solids";
  typeLabel: string;
  side?: string;
  duration?: string;
  amount?: string;
  notes?: string;
  food?: null;
  formulaBrand?: string;
} {
  const md = ev.metadata as {
    breast_side?: string;
    formula_brand?: string;
    duration_min?: number;
    food_name?: string;
  };
  let type: "breast" | "bottle" | "formula" | "solids" = "breast";
  if (ev.subtype === "solids") type = "solids";
  else if (ev.subtype === "bottle_breastmilk") type = "bottle";
  else if (ev.subtype === "bottle_formula") type = "formula";

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
    formulaBrand: type === "formula" ? md?.formula_brand || "" : undefined,
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
  if (e.type === "bottle" || e.type === "formula") {
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

/** Aggregate events by weekday label for simple bar chart (last 7 days). */
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

/** Parse pt-BR style time from `toLocaleTimeString` into HH:mm for combineDayAndTime. */
export function localeTimeStringToHhMm(localeTime: string): string {
  const t = localeTime.replace(/\./g, ":").trim();
  const m = t.match(/(\d{1,2})\D*(\d{2})/);
  if (!m) return "12:00";
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
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
