/* eslint-disable @typescript-eslint/no-explicit-any */
/** Mirrors GET /api/ui/bootstrap JSON (subset typed for app-design). */

export interface BabyRecord {
  id: string;
  name: string;
  birth_date: string;
  photo_url: string | null;
  created_at?: string | null;
}

export interface ProfileExtras {
  bloodType?: string | null;
  growthCards: GrowthCardSeed[];
  recentMilestones: RecentMilestoneSeed[];
  healthSummary: HealthSummarySeed;
}

export interface GrowthCardSeed {
  label: string;
  value: string;
  unit: string;
  percentile: number;
  icon: string;
  color: string;
}

export type MilestoneTileStatus = "observed" | "emerging" | "not_yet";

export interface RecentMilestoneSeed {
  title: string;
  /** Preferido; ausência trata como not_yet (bootstrap antigo). */
  status?: MilestoneTileStatus;
  observedAge: string | null;
}

export interface HealthSummarySeed {
  vaccines: { total: number; upToDate: boolean };
  vitamins: { active: number; names: string[] };
  events: { recent: number; lastEvent: string };
}

export interface UIBootstrapPayload {
  baby: BabyRecord;
  profile_extras: ProfileExtras;
  catalogs: Record<string, any>;
  content_shell: Record<string, any>;
  food_catalog: { foods: FoodItem[] };
  growth: Record<string, any>;
  baby_core: { pillars: PillarSeed[] };
  today: Record<string, any>;
  timeline_seed: { entries: TimelineEntrySeed[] };
  milestones: Record<string, any>;
  vaccines: { vaccines: VaccineSeed[] };
  vitamins: { vitamins: VitaminSeed[] };
  health_events: { events: HealthEventSeed[] };
  health_detail: Record<string, any>;
  caregivers_feed: Record<string, any>;
  tracker_logs: Record<string, any>;
  tracker_charts: Record<string, any>;
  activity_v2: ActivityV2Seed;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface PillarSeed {
  label: string;
  shortLabel: string;
  score: number;
  color: string;
  status: string;
  trend: "up" | "down" | "stable";
  detail: string;
}

export interface TimelineEntrySeed {
  type: string;
  subType?: string;
  time: string;
  caregiver: string;
  notes?: string;
  quantity?: number;
}

export interface VaccineSeed {
  id: string;
  name: string;
  date: string;
  manufacturer: string;
  location: string;
  hadReaction: boolean;
  reactionDetails: string;
  notes: string;
  dose: string;
}

export interface VitaminSeed {
  id: string;
  category?: "vitamin" | "medication";
  name: string;
  dose: string;
  unit: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  notes: string;
  history: { date: string; dose: string; notes: string }[];
}

export interface HealthEventSeed {
  id: string;
  type: string;
  date: string;
  endDate: string | null;
  description: string;
  notes: string;
}

export interface ActivityV2CategorySeed {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  activities: {
    id: string;
    label: string;
    icon: string;
    description?: string;
  }[];
}

export interface ActivityV2Seed {
  categories: ActivityV2CategorySeed[];
  durationOptions: number[];
  initialLogs: {
    id: string;
    time: string;
    type: string;
    label: string;
    duration: number;
    notes: string;
  }[];
  weekData: { day: string; min: number }[];
  defaultFavoriteActivityIds: string[];
}
