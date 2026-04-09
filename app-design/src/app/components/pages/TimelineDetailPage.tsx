import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Milk, Droplets, Moon, Activity, Bath, Pill,
} from "lucide-react";
import { DiaperIcon } from "../DiaperIcon";
import { CaregiverAvatar } from "../CaregiverAvatar";
import { TimePeriodFilter } from "../TimePeriodFilter";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { useTimePeriodFilter, dateLabelFromTimestamp } from "../../hooks/useTimePeriodFilter";
import { listEvents, type ApiEvent } from "@/api/client";
import { apiEventToTimelineRow, formatYmd } from "@/api/eventMappers";
import type { TimelineEntry } from "../Timeline";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  feeding: Milk,
  hydration: Droplets,
  sleep: Moon,
  diaper: DiaperIcon,
  activity: Activity,
  bath: Bath,
  health: Pill,
};

const colorMap: Record<string, string> = {
  feeding: "bg-baby-peach",
  hydration: "bg-baby-blue",
  sleep: "bg-baby-lavender",
  diaper: "bg-baby-yellow",
  activity: "bg-baby-mint",
  bath: "bg-baby-blue",
  health: "bg-baby-pink",
};

const labelMap: Record<string, string> = {
  feeding: "Alimentação",
  hydration: "Hidratação",
  sleep: "Sono",
  diaper: "Fralda",
  activity: "Atividade",
  bath: "Banho",
  health: "Saúde",
};

interface TimelineRow extends TimelineEntry {
  date?: string;
  caregiverId?: string;
}

export function TimelineDetailPage() {
  const navigate = useNavigate();
  const { babyId, caregiverId, canPersist, caregivers } = useUIBootstrap();
  const timePeriod = useTimePeriodFilter();

  const [allEvents, setAllEvents] = useState<ApiEvent[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(null);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId });
    setAllEvents(evs);
  }, [babyId, caregiverId, canPersist]);

  useEffect(() => {
    void refreshFromApi();
  }, [refreshFromApi]);

  const cmap = useMemo(
    () => new Map(caregivers.map((c) => [c.id, c.name])),
    [caregivers],
  );

  const rows = useMemo(() => {
    let filtered = timePeriod.filterEvents(allEvents);

    if (selectedCaregiver) {
      filtered = filtered.filter((e) => e.caregiver_id === selectedCaregiver);
    }

    return filtered
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((e): TimelineRow => ({
        ...apiEventToTimelineRow(e, cmap),
        date: dateLabelFromTimestamp(e.timestamp),
        caregiverId: e.caregiver_id,
      }));
  }, [allEvents, timePeriod.filterEvents, selectedCaregiver, cmap]);

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2>Linha do tempo</h2>
      </div>

      {/* Filters */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <TimePeriodFilter filter={timePeriod} />

          {/* Caregiver filter */}
          {caregivers.length > 1 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-2">Cuidador</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCaregiver(null)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    selectedCaregiver === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  Todos
                </button>
                {caregivers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaregiver(c.id)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1.5 ${
                      selectedCaregiver === c.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <CaregiverAvatar name={c.name} size="sm" />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="px-5 mb-2">
        <p className="text-sm text-muted-foreground">{timePeriod.title} ({rows.length})</p>
      </div>

      {/* Event list */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="space-y-1">
            {rows.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nenhum registro neste período.
              </p>
            )}
            {rows.map((entry) => {
              const Icon = iconMap[entry.type] || Activity;
              return (
                <div key={entry.id ?? `${entry.time}-${entry.type}`} className="flex items-start gap-3 py-3">
                  <div className="text-xs text-muted-foreground w-12 pt-1 shrink-0">
                    {timePeriod.period !== "today" && (
                      <p className="text-[10px] font-medium">{entry.date}</p>
                    )}
                    <p>{entry.time}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-full ${colorMap[entry.type] || "bg-muted"} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{labelMap[entry.type] || entry.type}</p>
                    {entry.subType && (
                      <p className="text-xs text-muted-foreground capitalize">{entry.subType}</p>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>
                    )}
                  </div>
                  <CaregiverAvatar name={entry.caregiver} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
