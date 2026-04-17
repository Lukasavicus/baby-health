import { Sparkles } from "lucide-react";
import { BabyCoreTile } from "../BabyCoreTile";

interface TodayHeroCardProps {
  dayName: string;
  dateStr: string;
  insight: string;
}

export function TodayHeroCard({ dayName, dateStr, insight }: TodayHeroCardProps) {
  return (
    <>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-baby-mint">Baby Health</h1>
        <p className="text-sm text-muted-foreground capitalize">
          {dayName}, {dateStr}
        </p>
      </div>

      {/* Baby Core Tile */}
      <div className="px-4 mb-4">
        <BabyCoreTile />
      </div>

      {/* Insight */}
      <div className="px-4 mb-4">
        <div className="bg-baby-mint/10 border border-baby-mint/20 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-baby-mint shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{insight}</p>
        </div>
      </div>
    </>
  );
}
