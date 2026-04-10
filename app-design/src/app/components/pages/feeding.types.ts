export interface FoodResult {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FeedingEntry {
  id: string;
  date?: string;
  time: string;
  type: "breast" | "formula" | "solids";
  typeLabel: string;
  side?: string;
  duration?: string;
  amount?: string;
  notes?: string;
  food?: FoodResult | null;
  foodName?: string;
  formulaBrand?: string;
}

export interface FeedingFormData {
  type: FeedingEntry["type"];
  time: string;
  dateYmd: string;
  side: string;
  duration: number;
  amount: number;
  notes: string;
  food: FoodResult | null;
  formula: string;
}

export interface FeedingTypeOption {
  id: FeedingEntry["type"];
  label: string;
}

export type FeedingFilterType = "all" | "breast" | "formula" | "solids";
