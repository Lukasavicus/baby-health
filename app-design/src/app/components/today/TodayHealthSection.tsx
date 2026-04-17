import { Pill, ShieldPlus, Heart, Syringe, Clock, Check } from "lucide-react";
import { TrackerCard } from "../TrackerCard";
import type { LogCategory } from "../LogSheet";

interface QuickItem {
  id: string;
  label: string;
}

interface VitMedItem {
  id: string;
  label: string;
  takenAt: string | null;
}

export interface TodayHealthSectionProps {
  healthHeadline: number;
  healthSlotsTotal: number;
  healthProgress: number;
  quickVitamins: QuickItem[];
  quickMeds: QuickItem[];
  vitaminsV2: VitMedItem[];
  medsV2: VitMedItem[];
  vitaminsVariant: "v1" | "v2";
  caregiverName: string;
  onLog: (entry: Record<string, unknown>) => Promise<void> | void;
  onToggleVitamin: (id: string) => void;
  onToggleMed: (id: string) => void;
  onOpenLog: (category?: LogCategory, subType?: string) => void;
  onNavigate: (path: string) => void;
}

export function TodayHealthSection({
  healthHeadline,
  healthSlotsTotal,
  healthProgress,
  quickVitamins,
  quickMeds,
  vitaminsV2,
  medsV2,
  vitaminsVariant,
  caregiverName,
  onLog,
  onToggleVitamin,
  onToggleMed,
  onOpenLog,
  onNavigate,
}: TodayHealthSectionProps) {
  return (
    <>
      {vitaminsVariant === "v1" && (
      <TrackerCard
        icon={Pill}
        title="Vitaminas & Medicamentos"
        value={String(healthHeadline)}
        subtitle="doses hoje"
        color="bg-baby-pink/40"
        onAction={() => onOpenLog("health")}
        onTap={() => onNavigate("/tracker/health")}
      >
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="flex gap-4">
            {/* Vitamins column */}
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-baby-mint/30 flex items-center justify-center bg-[#ffb7b266]">
                  <ShieldPlus className="w-3 h-3 text-pink-400" />
                </span>
                Vitaminas
              </p>
              <div className="flex flex-col gap-1.5">
                {quickVitamins.map((v) => (
                  <button
                    key={v.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const now = new Date();
                      onLog({
                        type: "health",
                        subType: "vitamin",
                        time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        timestamp: now,
                        caregiver: caregiverName,
                        notes: v.label,
                        healthName: v.label,
                      });
                    }}
                    className="bg-baby-pink/20 text-foreground/70 py-2 px-3 rounded-xl text-xs active:scale-95 transition-transform text-left truncate"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-border/50" />

            {/* Medications column */}
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-baby-pink/40 flex items-center justify-center">
                  <Heart className="w-3 h-3 text-pink-400" />
                </span>
                Medicamentos
              </p>
              <div className="flex flex-col gap-1.5">
                {quickMeds.map((m) => (
                  <button
                    key={m.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      const now = new Date();
                      onLog({
                        type: "health",
                        subType: "medication",
                        time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                        timestamp: now,
                        caregiver: caregiverName,
                        notes: m.label,
                        healthName: m.label,
                      });
                    }}
                    className="bg-baby-pink/20 text-foreground/70 py-2 px-3 rounded-xl text-xs active:scale-95 transition-transform text-left truncate"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TrackerCard>
      )}

      {vitaminsVariant === "v2" && (
      <TrackerCard
        icon={Pill}
        title="Vitaminas & Meds (V2)"
        value={`${healthHeadline}`}
        subtitle={healthSlotsTotal > 0 ? `/${healthSlotsTotal} doses` : "doses hoje"}
        color="bg-baby-pink/40"
        progress={healthProgress}
        onAction={() => onOpenLog("health")}
        onTap={() => onNavigate("/tracker/health")}
      >
        <div className="mt-3 pt-3 border-t border-border/30 space-y-3">
          {/* Vitamins */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#ffb7b266] flex items-center justify-center">
                <ShieldPlus className="w-3 h-3 text-pink-400" />
              </span>
              Vitaminas
            </p>
            <div className="flex flex-col gap-2">
              {vitaminsV2.map((v) => (
                <button
                  key={v.id}
                  onClick={(e) => { e.stopPropagation(); onToggleVitamin(v.id); }}
                  className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs transition-all active:scale-[0.98] ${
                    v.takenAt
                      ? "bg-baby-pink/50 ring-1 ring-baby-pink/60"
                      : "bg-baby-pink/15"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        v.takenAt ? "bg-baby-pink/70" : "bg-baby-pink/25"
                      }`}
                    >
                      {v.takenAt ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Pill className="w-3 h-3 text-foreground/40" />
                      )}
                    </div>
                    <span className={v.takenAt ? "text-foreground/90" : "text-foreground/60"}>
                      {v.label}
                    </span>
                  </div>
                  {v.takenAt ? (
                    <span className="flex items-center gap-1 text-[10px] text-foreground/60 bg-white/50 py-0.5 px-2 rounded-full">
                      <Clock className="w-3 h-3" />
                      {v.takenAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-foreground/35">Toque para registrar</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-baby-pink/40 flex items-center justify-center">
                <Heart className="w-3 h-3 text-pink-400" />
              </span>
              Medicamentos
            </p>
            <div className="flex flex-col gap-2">
              {medsV2.map((m) => (
                <button
                  key={m.id}
                  onClick={(e) => { e.stopPropagation(); onToggleMed(m.id); }}
                  className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs transition-all active:scale-[0.98] ${
                    m.takenAt
                      ? "bg-baby-lavender/50 ring-1 ring-baby-lavender/60"
                      : "bg-baby-lavender/15"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        m.takenAt ? "bg-baby-lavender/70" : "bg-baby-lavender/25"
                      }`}
                    >
                      {m.takenAt ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Syringe className="w-3 h-3 text-foreground/40" />
                      )}
                    </div>
                    <span className={m.takenAt ? "text-foreground/90" : "text-foreground/60"}>
                      {m.label}
                    </span>
                  </div>
                  {m.takenAt ? (
                    <span className="flex items-center gap-1 text-[10px] text-foreground/60 bg-white/50 py-0.5 px-2 rounded-full">
                      <Clock className="w-3 h-3" />
                      {m.takenAt}
                    </span>
                  ) : (
                    <span className="text-[10px] text-foreground/35">Toque para registrar</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </TrackerCard>
      )}
    </>
  );
}
