import { Bath, Check, Milk, UtensilsCrossed } from "lucide-react";
import { TrackerCard } from "../TrackerCard";
import type { TodayTrackerSummaries } from "@/api/todayAggregates";
import type { LogCategory } from "../LogSheet";

interface QuickActivity {
  id: string;
  label: string;
  icon: string;
  Icon: React.ComponentType<{ className?: string }>;
}

interface ActivityV2Row {
  label: string;
  icon: string;
  bg: string;
  color: string;
  active: boolean;
  Icon: React.ComponentType<{ className?: string }>;
}

export interface TodayTrackerGridProps {
  summaries: TodayTrackerSummaries;
  hydrationMlDisplayed: number;
  quickActivities: QuickActivity[];
  activityV2Preview: ActivityV2Row[];
  activitiesVariant: "v1" | "v2";
  icons: {
    Milk: React.ComponentType<{ className?: string }>;
    Droplets: React.ComponentType<{ className?: string }>;
    Moon: React.ComponentType<{ className?: string }>;
    Diaper: React.ComponentType<{ className?: string }>;
    Activity: React.ComponentType<{ className?: string }>;
  };
  onOpenLog: (category?: LogCategory, subType?: string) => void;
  onNavigate: (path: string) => void;
  onQuickFeeding: (type: string) => void;
  onQuickActivity: (actId: string) => void;
}

export function TodayTrackerGrid({
  summaries,
  hydrationMlDisplayed,
  quickActivities,
  activityV2Preview,
  activitiesVariant,
  icons,
  onOpenLog,
  onNavigate,
  onQuickFeeding,
  onQuickActivity,
}: TodayTrackerGridProps) {
  return (
    <>
      {/* Feeding with quick options */}
      <TrackerCard
        icon={icons.Milk}
        title="Alimentação"
        value={String(summaries.feedingCount)}
        subtitle="refeições hoje"
        color="bg-baby-peach/40"
        onAction={() => onOpenLog("feeding")}
        onTap={() => onNavigate("/tracker/feeding")}
      >
        <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
          <button
            onClick={(e) => { e.stopPropagation(); onQuickFeeding("breast"); }}
            className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <Milk className="w-3 h-3 inline mr-1" />Amamentação
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickFeeding("formula"); }}
            className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <Milk className="w-3 h-3 inline mr-1" />Mamadeira
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickFeeding("solids"); }}
            className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
          >
            <UtensilsCrossed className="w-3 h-3 inline mr-1" />Sólidos
          </button>
        </div>
      </TrackerCard>

      <TrackerCard
        icon={icons.Droplets}
        title="Hidratação"
        value={`${hydrationMlDisplayed}`}
        subtitle={`/${summaries.hydrationGoalMl} ml`}
        color="bg-baby-blue/40"
        progress={
          summaries.hydrationGoalMl > 0
            ? (hydrationMlDisplayed / summaries.hydrationGoalMl) * 100
            : 0
        }
        onAction={() => onOpenLog("hydration")}
        onTap={() => onNavigate("/tracker/hydration")}
      />

      <TrackerCard
        icon={icons.Moon}
        title="Sono"
        value={summaries.sleepTotalLabel}
        subtitle="total hoje"
        color="bg-baby-lavender/40"
        onAction={() => onOpenLog("sleep")}
        onTap={() => onNavigate("/tracker/sleep")}
      />

      <TrackerCard
        icon={icons.Diaper}
        title="Fraldas"
        value={String(summaries.diaperCount)}
        subtitle="trocas hoje"
        color="bg-baby-yellow/40"
        onAction={() => onOpenLog("diaper")}
        onTap={() => onNavigate("/tracker/diaper")}
      />

      {activitiesVariant === "v1" && (
        <TrackerCard
          icon={icons.Activity}
          title="Atividades"
          value={String(summaries.activitySessions)}
          subtitle="sessões hoje"
          color="bg-baby-mint/40"
          onAction={() => onOpenLog("activity")}
          onTap={() => onNavigate("/tracker/activity")}
        >
          <div className="flex gap-3 mt-3 pt-3 border-t border-border/30">
            {quickActivities.map((qa) => (
              <button
                key={qa.id}
                onClick={(e) => { e.stopPropagation(); onQuickActivity(qa.id); }}
                className="flex-1 flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-baby-mint/30 flex items-center justify-center">
                  <qa.Icon className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="text-[10px] text-muted-foreground">{qa.label}</span>
              </button>
            ))}
          </div>
        </TrackerCard>
      )}

      {activitiesVariant === "v2" && (
        <TrackerCard
          icon={icons.Activity}
          title="Atividades (V2)"
          value={String(summaries.activitySessions)}
          subtitle="sessões hoje"
          color="bg-baby-mint/40"
          onAction={() => onOpenLog("activity")}
          onTap={() => onNavigate("/tracker/activity")}
        >
          <div className="mt-3 pt-3 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground mb-2">Áreas estimuladas</p>
            <div className="flex flex-wrap gap-1.5">
              {activityV2Preview.map((area) => (
                <div
                  key={area.label}
                  className={`flex items-center gap-1 py-1 px-2 rounded-full text-[10px] transition-all ${
                    area.active
                      ? `${area.bg} ${area.color}`
                      : "bg-secondary/50 text-muted-foreground/40"
                  }`}
                >
                  <area.Icon className="w-3 h-3" />
                  {area.label}
                  {area.active && <Check className="w-2.5 h-2.5" />}
                </div>
              ))}
            </div>
          </div>
        </TrackerCard>
      )}

      {/* Bath */}
      <TrackerCard
        icon={Bath}
        title="Banho"
        value={String(summaries.bathCount)}
        subtitle="banho hoje"
        color="bg-baby-blue/40"
        onAction={() => onOpenLog("bath")}
        onTap={() => onNavigate("/tracker/bath")}
      />
    </>
  );
}
