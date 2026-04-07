import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Sparkles,
  Bath,
  Pill,
  Syringe,
  ShieldPlus,
  Heart,
  Hand,
  CupSoda,
  UtensilsCrossed,
  Clock,
  Check,
  Activity,
  Milk,
  Droplets,
  Moon,
} from "lucide-react";
import { TrackerCard } from "../TrackerCard";
import { AwakeWindow } from "../AwakeWindow";
import { Timeline, type TimelineEntry } from "../Timeline";
import { LogSheet, type LogCategory } from "../LogSheet";
import { BabyCoreTile } from "../BabyCoreTile";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
  type ApiEvent,
} from "@/api/client";
import {
  apiEventToTimelineRow,
  formatYmd,
  logSheetEntryToIncoming,
  combineDayAndTime,
  localeTimeStringToHhMm,
} from "@/api/eventMappers";
import type { ActivityV2CategorySeed, UIBootstrapPayload } from "@/api/types";
import {
  aggregateTodayFromApi,
  aggregateTodayFromSeed,
  buildActivityV2PreviewRows,
  collectActivitySubtypeIdsForToday,
  collectActivitySubtypeIdsFromSeed,
  emptyTodaySummaries,
  resolveHydrationGoalMl,
} from "@/api/todayAggregates";

export function TodayPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist, caregivers } = useUIBootstrap();
  const openSleepEventIdRef = useRef<string | null>(null);

  const insights = (data?.today?.insights ?? []) as string[];
  const quickActivities = useMemo(
    () =>
      ((data?.today?.quickActivities ?? []) as { id: string; label: string; icon: string }[]).map(
        (q) => ({ ...q, Icon: getIcon(q.icon) }),
      ),
    [data?.today?.quickActivities],
  );
  const quickVitamins = (data?.today?.quickVitamins ?? []) as { id: string; label: string }[];
  const quickMeds = (data?.today?.quickMeds ?? []) as { id: string; label: string }[];

  const [todayApiEvents, setTodayApiEvents] = useState<ApiEvent[] | null>(null);

  const caregiverName = useMemo(() => {
    const c = caregivers.find((x) => x.id === caregiverId);
    return c?.name?.trim() || "—";
  }, [caregivers, caregiverId]);

  const MilkI = getIcon("Milk");
  const DropletsI = getIcon("Droplets");
  const MoonI = getIcon("Moon");
  const DiaperI = getIcon("Diaper");
  const ActivityI = getIcon("Activity");

  const [logOpen, setLogOpen] = useState(false);
  const [logCategory, setLogCategory] =
    useState<LogCategory>(null);
  const [logSubType, setLogSubType] = useState("");
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [water, setWater] = useState(0);
  const [insightIdx, setInsightIdx] = useState(0);
  const [isSleeping, setIsSleeping] = useState(false);
  const [lastWakeTime, setLastWakeTime] = useState<Date>(() => new Date());

  const [vitaminsV2, setVitaminsV2] = useState<
    { id: string; label: string; takenAt: string | null }[]
  >([]);
  const [medsV2, setMedsV2] = useState<
    { id: string; label: string; takenAt: string | null }[]
  >([]);

  const reloadTodayTimeline = useMemo(() => {
    return async () => {
      if (!canPersist || !babyId || !caregiverId) return;
      const day = formatYmd(new Date());
      try {
        const evs = await listEvents({ baby_id: babyId, date: day });
        setTodayApiEvents(evs);
        const cmap = new Map(caregivers.map((c) => [c.id, c.name]));
        const rows = evs
          .slice()
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          )
          .map((e) => apiEventToTimelineRow(e, cmap));
        setEntries(rows);
      } catch {
        setTodayApiEvents(null);
        const te = data?.timeline_seed?.entries as TimelineEntry[] | undefined;
        if (te?.length) setEntries(te);
        else setEntries([]);
      }
    };
  }, [canPersist, babyId, caregiverId, caregivers, data]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void reloadTodayTimeline();
      return;
    }
    setTodayApiEvents(null);
    const te = data.timeline_seed?.entries as TimelineEntry[] | undefined;
    if (te?.length) setEntries(te);
    else setEntries([]);
  }, [data, canPersist, babyId, caregiverId, reloadTodayTimeline]);

  const summaries = useMemo(() => {
    const dayYmd = formatYmd(new Date());
    const goal = resolveHydrationGoalMl(data as UIBootstrapPayload | undefined);
    if (canPersist && todayApiEvents !== null) {
      return aggregateTodayFromApi(todayApiEvents, dayYmd, goal);
    }
    if (data) {
      return aggregateTodayFromSeed(data as UIBootstrapPayload);
    }
    return emptyTodaySummaries(goal);
  }, [canPersist, todayApiEvents, data]);

  const activitySubtypeIds = useMemo(() => {
    const dayYmd = formatYmd(new Date());
    if (canPersist && todayApiEvents !== null) {
      return collectActivitySubtypeIdsForToday(todayApiEvents, dayYmd);
    }
    if (data) {
      return collectActivitySubtypeIdsFromSeed(data as UIBootstrapPayload);
    }
    return new Set<string>();
  }, [canPersist, todayApiEvents, data]);

  const activityV2Preview = useMemo(() => {
    const cats = (data?.activity_v2?.categories ?? []) as ActivityV2CategorySeed[];
    const rows = buildActivityV2PreviewRows(cats, activitySubtypeIds, 6);
    return rows.map((r) => ({
      ...r,
      Icon: getIcon(r.icon),
    }));
  }, [data?.activity_v2?.categories, activitySubtypeIds]);

  useEffect(() => {
    if (!data || canPersist) return;
    setWater(aggregateTodayFromSeed(data as UIBootstrapPayload).hydrationMl);
  }, [canPersist, data]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && todayApiEvents !== null) {
      setWater(summaries.hydrationMl);
    }
  }, [canPersist, todayApiEvents, summaries.hydrationMl, data]);

  useEffect(() => {
    const off = data?.today?.lastWakeOffsetMs;
    if (typeof off === "number") {
      setLastWakeTime(new Date(Date.now() - off));
    }
  }, [data?.today?.lastWakeOffsetMs]);

  useEffect(() => {
    if (insights.length) {
      setInsightIdx(Math.floor(Math.random() * insights.length));
    }
  }, [insights]);

  useEffect(() => {
    const vi = data?.today?.vitaminItems as
      | { id: string; label: string; takenAt: string | null }[]
      | undefined;
    if (vi?.length) setVitaminsV2(vi);
  }, [data?.today?.vitaminItems]);

  useEffect(() => {
    const mi = data?.today?.medItems as
      | { id: string; label: string; takenAt: string | null }[]
      | undefined;
    if (mi?.length) setMedsV2(mi);
  }, [data?.today?.medItems]);

  const handleToggleVitamin = (id: string) => {
    setVitaminsV2((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              takenAt: v.takenAt
                ? null
                : new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
            }
          : v,
      ),
    );
  };

  const handleToggleMed = (id: string) => {
    setMedsV2((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              takenAt: m.takenAt
                ? null
                : new Date().toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
            }
          : m,
      ),
    );
  };

  const openLog = (category: LogCategory = null, subType = "") => {
    setLogCategory(category);
    setLogSubType(subType);
    setLogOpen(true);
  };

  const handleLog = async (entry: Record<string, unknown>) => {
    if (canPersist && babyId && caregiverId) {
      try {
        const day = formatYmd(new Date());
        const payload = logSheetEntryToIncoming(entry, babyId, caregiverId, day);
        await createEvent(payload);
        await reloadTodayTimeline();
      } catch (e) {
        console.error(e);
      }
      return;
    }
    setEntries([
      {
        type: String(entry.type),
        subType: entry.subType as string | undefined,
        time: String(entry.time ?? ""),
        caregiver: String(entry.caregiver ?? caregiverName),
        notes: entry.notes as string | undefined,
        quantity: entry.quantity as number | undefined,
      },
      ...entries,
    ]);
    if (entry.type === "hydration")
      setWater(water + Number(entry.quantity || 60));
  };

  const handleToggleSleep = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (canPersist && babyId && caregiverId) {
      const day = formatYmd(now);
      const ts = combineDayAndTime(day, localeTimeStringToHhMm(time));
      void (async () => {
        try {
          if (isSleeping) {
            const id = openSleepEventIdRef.current;
            if (id) {
              await updateEvent(id, { end_timestamp: ts });
              openSleepEventIdRef.current = null;
            }
            setLastWakeTime(now);
          } else {
            const created = await createEvent({
              baby_id: babyId,
              caregiver_id: caregiverId,
              type: "sleep",
              subtype: "nap",
              timestamp: ts,
              notes: "Bebê dormiu",
              metadata: {},
            });
            openSleepEventIdRef.current = created.id;
          }
          await reloadTodayTimeline();
        } catch (e) {
          console.error(e);
        }
      })();
      setIsSleeping(!isSleeping);
      return;
    }

    if (isSleeping) {
      void handleLog({
        type: "sleep",
        subType: "wake",
        time,
        timestamp: now,
        caregiver: caregiverName,
        notes: "Bebê acordou",
      });
      setLastWakeTime(now);
    } else {
      void handleLog({
        type: "sleep",
        subType: "asleep",
        time,
        timestamp: now,
        caregiver: caregiverName,
        notes: "Bebê dormiu",
      });
    }
    setIsSleeping(!isSleeping);
  };

  const handleQuickActivity = (actId: string) => {
    openLog("activity", actId);
  };

  const handleQuickFeeding = (type: string) => {
    openLog("feeding", type);
  };

  const healthTakenLocal =
    vitaminsV2.filter((v) => v.takenAt).length + medsV2.filter((m) => m.takenAt).length;
  const healthHeadline =
    canPersist && todayApiEvents !== null ? summaries.healthEventsToday : healthTakenLocal;
  const healthSlotsTotal = vitaminsV2.length + medsV2.length;
  const healthProgress =
    healthSlotsTotal > 0 ? Math.min(100, (healthHeadline / healthSlotsTotal) * 100) : 0;

  /** While API is loading, keep card in sync with seed summaries; after load, `water` tracks API + refetch. */
  const hydrationMlDisplayed =
    !canPersist ? water : todayApiEvents !== null ? water : summaries.hydrationMl;

  const today = new Date();
  const dayName = today.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
  const dateStr = today.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });

  return (
    <div className="pb-6">
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
          <p className="text-xs text-muted-foreground">
            {insights[insightIdx] ?? "—"}
          </p>
        </div>
      </div>

      {/* Awake Window + Sleep toggle */}
      <div className="px-4 mb-4">
        <AwakeWindow
          lastWake={lastWakeTime}
          isSleeping={isSleeping}
          onToggleSleep={handleToggleSleep}
        />
      </div>

      {/* Tracker Cards */}
      <div className="px-4 space-y-4 mb-6">
        {/* Feeding with quick options */}
        <TrackerCard
          icon={MilkI}
          title="Alimentação"
          value={String(summaries.feedingCount)}
          subtitle="refeições hoje"
          color="bg-baby-peach/40"
          onAction={() => openLog("feeding")}
          onTap={() => navigate("/tracker/feeding")}
        >
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickFeeding("breast_l");
              }}
              className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <Hand className="w-3 h-3 inline mr-1" />Esq
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickFeeding("breast_r");
              }}
              className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <Hand className="w-3 h-3 inline mr-1" />Dir
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickFeeding("bottle");
              }}
              className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <CupSoda className="w-3 h-3 inline mr-1" />Mamad.
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickFeeding("solids");
              }}
              className="flex-1 bg-baby-peach/30 text-foreground/70 py-2 rounded-xl text-xs active:scale-95 transition-transform flex items-center justify-center gap-1"
            >
              <UtensilsCrossed className="w-3 h-3 inline mr-1" />Sólidos
            </button>
          </div>
        </TrackerCard>

        <TrackerCard
          icon={DropletsI}
          title="Hidratação"
          value={`${hydrationMlDisplayed}`}
          subtitle={`/${summaries.hydrationGoalMl} ml`}
          color="bg-baby-blue/40"
          progress={
            summaries.hydrationGoalMl > 0
              ? (hydrationMlDisplayed / summaries.hydrationGoalMl) * 100
              : 0
          }
          onAction={() => openLog("hydration")}
          onTap={() => navigate("/tracker/hydration")}
        />

        <TrackerCard
          icon={MoonI}
          title="Sono"
          value={summaries.sleepTotalLabel}
          subtitle="total hoje"
          color="bg-baby-lavender/40"
          onAction={() => openLog("sleep")}
          onTap={() => navigate("/tracker/sleep")}
        />

        <TrackerCard
          icon={DiaperI}
          title="Fraldas"
          value={String(summaries.diaperCount)}
          subtitle="trocas hoje"
          color="bg-baby-yellow/40"
          onAction={() => openLog("diaper")}
          onTap={() => navigate("/tracker/diaper")}
        />

        {/* Activities V1 + V2: same session count (single API stream `activity`; see todayAggregates). */}
        <TrackerCard
          icon={ActivityI}
          title="Atividades"
          value={String(summaries.activitySessions)}
          subtitle="sessões hoje"
          color="bg-baby-mint/40"
          onAction={() => openLog("activity")}
          onTap={() => navigate("/tracker/activity")}
        >
          <div className="flex gap-3 mt-3 pt-3 border-t border-border/30">
            {quickActivities.map((qa) => (
              <button
                key={qa.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickActivity(qa.id);
                }}
                className="flex-1 flex flex-col items-center gap-1 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-baby-mint/30 flex items-center justify-center">
                  <qa.Icon className="w-4 h-4 text-foreground/60" />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {qa.label}
                </span>
              </button>
            ))}
          </div>
        </TrackerCard>

        {/* V2: Activities with developmental categories */}
        <TrackerCard
          icon={ActivityI}
          title="Atividades (V2)"
          value={String(summaries.activitySessions)}
          subtitle="sessões hoje"
          color="bg-baby-mint/40"
          onAction={() => openLog("activity")}
          onTap={() => navigate("/tracker/activity-v2")}
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

        {/* Bath */}
        <TrackerCard
          icon={Bath}
          title="Banho"
          value={String(summaries.bathCount)}
          subtitle="banho hoje"
          color="bg-baby-blue/40"
          onAction={() => openLog("bath")}
          onTap={() => navigate("/tracker/bath")}
        />

        {/* Vitamins & Medications */}
        <TrackerCard
          icon={Pill}
          title="Vitaminas & Medicamentos"
          value={String(healthHeadline)}
          subtitle="doses hoje"
          color="bg-baby-pink/40"
          onAction={() => openLog("health")}
          onTap={() => navigate("/tracker/health")}
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
                        handleLog({
                          type: "health",
                          subType: "vitamin",
                          time: now.toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          ),
                          timestamp: now,
                          caregiver: caregiverName,
                          notes: v.label,
                          healthName: v.label,
                        });
                      }}
                      className="bg-baby-pink/20 text-foreground/70 py-2 px-3 rounded-xl text-xs active:scale-95 transition-transform text-left"
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
                        handleLog({
                          type: "health",
                          subType: "medication",
                          time: now.toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          ),
                          timestamp: now,
                          caregiver: caregiverName,
                          notes: m.label,
                          healthName: m.label,
                        });
                      }}
                      className="bg-baby-pink/20 text-foreground/70 py-2 px-3 rounded-xl text-xs active:scale-95 transition-transform text-left"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TrackerCard>

        {/* V2: Vitamins & Medications — quick status view */}
        <TrackerCard
          icon={Pill}
          title="Vitaminas & Meds (V2)"
          value={`${healthHeadline}`}
          subtitle={
            healthSlotsTotal > 0 ? `/${healthSlotsTotal} doses` : "doses hoje"
          }
          color="bg-baby-pink/40"
          progress={healthProgress}
          onAction={() => openLog("health")}
          onTap={() => navigate("/tracker/health")}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleVitamin(v.id);
                    }}
                    className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs transition-all active:scale-[0.98] ${
                      v.takenAt
                        ? "bg-baby-pink/50 ring-1 ring-baby-pink/60"
                        : "bg-baby-pink/15"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          v.takenAt
                            ? "bg-baby-pink/70"
                            : "bg-baby-pink/25"
                        }`}
                      >
                        {v.takenAt ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Pill className="w-3 h-3 text-foreground/40" />
                        )}
                      </div>
                      <span
                        className={
                          v.takenAt
                            ? "text-foreground/90"
                            : "text-foreground/60"
                        }
                      >
                        {v.label}
                      </span>
                    </div>
                    {v.takenAt ? (
                      <span className="flex items-center gap-1 text-[10px] text-foreground/60 bg-white/50 py-0.5 px-2 rounded-full">
                        <Clock className="w-3 h-3" />
                        {v.takenAt}
                      </span>
                    ) : (
                      <span className="text-[10px] text-foreground/35">
                        Toque para registrar
                      </span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMed(m.id);
                    }}
                    className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl text-xs transition-all active:scale-[0.98] ${
                      m.takenAt
                        ? "bg-baby-lavender/50 ring-1 ring-baby-lavender/60"
                        : "bg-baby-lavender/15"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          m.takenAt
                            ? "bg-baby-lavender/70"
                            : "bg-baby-lavender/25"
                        }`}
                      >
                        {m.takenAt ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Syringe className="w-3 h-3 text-foreground/40" />
                        )}
                      </div>
                      <span
                        className={
                          m.takenAt
                            ? "text-foreground/90"
                            : "text-foreground/60"
                        }
                      >
                        {m.label}
                      </span>
                    </div>
                    {m.takenAt ? (
                      <span className="flex items-center gap-1 text-[10px] text-foreground/60 bg-white/50 py-0.5 px-2 rounded-full">
                        <Clock className="w-3 h-3" />
                        {m.takenAt}
                      </span>
                    ) : (
                      <span className="text-[10px] text-foreground/35">
                        Toque para registrar
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TrackerCard>
      </div>

      {/* Timeline */}
      <div className="px-4">
        <Timeline
          entries={entries}
          onEdit={(index) => {
            // Open log sheet pre-filled for that entry type
            const entry = entries[index];
            if (entry) openLog(entry.type as LogCategory, entry.subType);
          }}
          onDelete={(index) => {
            const entry = entries[index];
            if (canPersist && entry?.id) {
              void (async () => {
                try {
                  await deleteEvent(entry.id!);
                  await reloadTodayTimeline();
                } catch (e) {
                  console.error(e);
                }
              })();
              return;
            }
            setEntries(entries.filter((_, i) => i !== index));
          }}
        />
      </div>

      {/* FAB - generic register */}
      <button
        onClick={() => openLog(null)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-30 active:scale-90 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      <LogSheet
        open={logOpen}
        onOpenChange={setLogOpen}
        onLog={handleLog}
        initialCategory={logCategory}
        initialSubType={logSubType}
      />
    </div>
  );
}