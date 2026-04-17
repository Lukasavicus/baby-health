/**
 * Today (Hoje) tracker summaries: API events for the local calendar day, or seed/bootstrap fallbacks.
 * Activity V1 and V2 share the same API event type "activity" (plan option A: same session count on both cards).
 */
import type { ApiEvent } from "./client";
import type { ActivityV2CategorySeed, UIBootstrapPayload } from "./types";
import { apiEventToSleepEntry, formatYmd } from "./eventMappers";

export const DEFAULT_HYDRATION_GOAL_ML = 500;

export interface TodayTrackerSummaries {
  feedingCount: number;
  sleepTotalMin: number;
  sleepTotalLabel: string;
  hydrationMl: number;
  hydrationGoalMl: number;
  diaperCount: number;
  bathCount: number;
  /** Total activity sessions today (V1 + V2 cards show the same count — one backend stream). */
  activitySessions: number;
  healthEventsToday: number;
}

export function resolveHydrationGoalMl(data: UIBootstrapPayload | null | undefined): number {
  const g = data?.today?.hydrationGoalMl;
  if (typeof g === "number" && g > 0) return g;
  return DEFAULT_HYDRATION_GOAL_ML;
}

/** Wall-clock segment length; handles overnight wrap (end before start). */
export function calcSleepSegmentMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function formatTodayDurationMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (min <= 0) return "0min";
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function emptyTodaySummaries(hydrationGoalMl: number): TodayTrackerSummaries {
  return {
    feedingCount: 0,
    sleepTotalMin: 0,
    sleepTotalLabel: formatTodayDurationMin(0),
    hydrationMl: 0,
    hydrationGoalMl,
    diaperCount: 0,
    bathCount: 0,
    activitySessions: 0,
    healthEventsToday: 0,
  };
}

/**
 * Completed sleep only: events without end_timestamp do not add minutes (open nap handled in UI elsewhere).
 */
export function aggregateTodayFromApi(
  events: ApiEvent[],
  dayYmd: string,
  hydrationGoalMl: number,
): TodayTrackerSummaries {
  const onDay = (e: ApiEvent) => formatYmd(new Date(e.timestamp)) === dayYmd;
  const evs = events.filter(onDay);

  let feedingCount = 0;
  let hydrationMl = 0;
  let diaperCount = 0;
  let bathCount = 0;
  let activitySessions = 0;
  let healthEventsToday = 0;
  let sleepTotalMin = 0;

  for (const e of evs) {
    switch (e.type) {
      case "feeding":
        feedingCount++;
        break;
      case "hydration":
        hydrationMl += e.quantity ?? 0;
        break;
      case "diaper":
        diaperCount++;
        break;
      case "bath":
        bathCount++;
        break;
      case "activity":
        activitySessions++;
        break;
      case "health":
      case "medication":
        healthEventsToday++;
        break;
      case "sleep":
        if (e.end_timestamp) {
          const se = apiEventToSleepEntry(e);
          sleepTotalMin += calcSleepSegmentMinutes(se.start, se.end);
        }
        break;
      default:
        break;
    }
  }

  return {
    feedingCount,
    sleepTotalMin,
    sleepTotalLabel: formatTodayDurationMin(sleepTotalMin),
    hydrationMl,
    hydrationGoalMl,
    diaperCount,
    bathCount,
    activitySessions,
    healthEventsToday,
  };
}

function countSeedHealthDoses(today: Record<string, unknown> | undefined): number {
  const vi = (today?.vitaminItems ?? []) as { takenAt?: string | null }[];
  const mi = (today?.medItems ?? []) as { takenAt?: string | null }[];
  const taken = (x: { takenAt?: string | null }) =>
    x.takenAt != null && String(x.takenAt).trim() !== "";
  return [...vi, ...mi].filter(taken).length;
}

export function aggregateTodayFromSeed(data: UIBootstrapPayload): TodayTrackerSummaries {
  const hydrationGoalMl = resolveHydrationGoalMl(data);
  const tl = data.tracker_logs ?? {};

  const feedings = (tl.feeding?.initialFeedings ?? []) as unknown[];
  const sleepLogs = (tl.sleep?.initialLogs ?? []) as { start: string; end: string }[];
  const hydLogs = (tl.hydration?.initialLogs ?? []) as { amount?: number }[];
  const diapers = (tl.diaper?.initialLogs ?? []) as unknown[];
  const baths = (tl.bath?.initialLogs ?? []) as unknown[];
  const actV1 = (tl.activity?.initialLogs ?? []) as unknown[];
  const av2Logs = (data.activity_v2?.initialLogs ?? []) as unknown[];

  const hydrationMl = hydLogs.reduce((s, l) => s + (Number(l.amount) || 0), 0);
  const sleepTotalMin = sleepLogs.reduce(
    (s, l) => s + calcSleepSegmentMinutes(l.start, l.end),
    0,
  );

  // Prefer V2 demo log count when present; otherwise V1 seed list (same headline on both cards).
  const activitySessions = av2Logs.length > 0 ? av2Logs.length : actV1.length;

  return {
    feedingCount: feedings.length,
    sleepTotalMin,
    sleepTotalLabel: formatTodayDurationMin(sleepTotalMin),
    hydrationMl,
    hydrationGoalMl,
    diaperCount: diapers.length,
    bathCount: baths.length,
    activitySessions,
    healthEventsToday: countSeedHealthDoses(data.today as Record<string, unknown>),
  };
}

export function collectActivitySubtypeIdsForToday(
  events: ApiEvent[],
  dayYmd: string,
): Set<string> {
  const s = new Set<string>();
  for (const e of events) {
    if (e.type !== "activity") continue;
    if (formatYmd(new Date(e.timestamp)) !== dayYmd) continue;
    if (e.subtype) s.add(e.subtype);
  }
  return s;
}

export function collectActivitySubtypeIdsFromSeed(data: UIBootstrapPayload): Set<string> {
  const logs = data.activity_v2?.initialLogs ?? [];
  return new Set(logs.map((l) => l.type).filter(Boolean));
}

/** Rows for V2 “áreas estimuladas”: active when at least one log today maps to that category. */
export function buildActivityV2PreviewRows(
  categories: ActivityV2CategorySeed[],
  subtypeIds: Set<string>,
  limit = 6,
): { label: string; icon: string; color: string; bg: string; active: boolean }[] {
  return categories.slice(0, limit).map((c) => ({
    label: c.label.split(" ")[0] ?? c.label,
    icon: c.icon,
    color: c.color,
    bg: c.bgColor,
    active: c.activities.some((a) => subtypeIds.has(a.id)),
  }));
}
