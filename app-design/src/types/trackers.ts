export type { FoodResult, FeedingEntry, FeedingFormData, FeedingTypeOption, FeedingFilterType } from "../app/components/pages/feeding.types";

export interface SleepEntry {
  id: string;
  date?: string;
  type: "night" | "nap";
  typeLabel: string;
  start: string;
  end: string;
  location: string;
  notes: string;
}

export interface HydrationEntry {
  id: string;
  date?: string;
  time: string;
  amount: number;
  type: "water" | "juice" | "tea" | "other";
  typeLabel: string;
  notes: string;
}

export type BathTempType = "frio" | "morno" | "quente";

export interface BathEntry {
  id: string;
  date?: string;
  time: string;
  temp: BathTempType;
  tempLabel: string;
  duration: number;
  notes: string;
}

export type DiaperType = "pee" | "poo" | "mixed";
export type VolumeLevel = 1 | 2 | 3 | 4;

export interface DiaperEntry {
  id: string;
  date?: string;
  time: string;
  type: DiaperType;
  typeLabel: string;
  peeVolume: VolumeLevel;
  pooVolume: VolumeLevel;
  notes: string;
}

export interface ActivityEntry {
  id: string;
  time: string;
  type: string;
  label: string;
  duration: number;
  notes: string;
}
