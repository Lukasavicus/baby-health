import { Apple, Milk, Icon } from "lucide-react";
import { bottleBaby } from "@lucide/lab";
import type { FeedingFilterType } from "./feeding.types";

interface FeedingSummaryCardsProps {
  breastCount: number;
  solidsCount: number;
  totalMl: number;
  filterType: FeedingFilterType;
  onFilterChange: (type: FeedingFilterType) => void;
}

export function FeedingSummaryCards({
  breastCount,
  solidsCount,
  totalMl,
  filterType,
  onFilterChange,
}: FeedingSummaryCardsProps) {
  const toggle = (t: Exclude<FeedingFilterType, "all">) =>
    onFilterChange(filterType === t ? "all" : t);

  return (
    <div className="px-4 mb-4">
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <button
            onClick={() => toggle("breast")}
            className={`transition-all ${filterType !== "all" && filterType !== "breast" ? "opacity-40" : ""}`}
          >
            <div className={`w-10 h-10 rounded-full bg-baby-peach/40 flex items-center justify-center mx-auto mb-2 transition-all ${filterType === "breast" ? "ring-2 ring-baby-peach scale-110" : ""}`}>
              <Icon iconNode={bottleBaby} className="w-5 h-5 text-foreground/60" />
            </div>
            <p className="text-2xl">{breastCount}x</p>
            <p className="text-[10px] text-muted-foreground">leite</p>
          </button>
          <button
            onClick={() => toggle("solids")}
            className={`transition-all ${filterType !== "all" && filterType !== "solids" ? "opacity-40" : ""}`}
          >
            <div className={`w-10 h-10 rounded-full bg-baby-mint/40 flex items-center justify-center mx-auto mb-2 transition-all ${filterType === "solids" ? "ring-2 ring-baby-mint scale-110" : ""}`}>
              <Apple className="w-5 h-5 text-foreground/60" />
            </div>
            <p className="text-2xl">{solidsCount}x</p>
            <p className="text-[10px] text-muted-foreground">sólidos</p>
          </button>
          <button
            onClick={() => toggle("formula")}
            className={`transition-all ${filterType !== "all" && filterType !== "formula" ? "opacity-40" : ""}`}
          >
            <div className={`w-10 h-10 rounded-full bg-baby-blue/40 flex items-center justify-center mx-auto mb-2 transition-all ${filterType === "formula" ? "ring-2 ring-baby-blue scale-110" : ""}`}>
              <Milk className="w-5 h-5 text-foreground/60" />
            </div>
            <p className="text-2xl">{totalMl}</p>
            <p className="text-[10px] text-muted-foreground">ml total</p>
          </button>
        </div>
      </div>
    </div>
  );
}
