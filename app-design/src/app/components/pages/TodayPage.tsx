import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AwakeWindow } from "../AwakeWindow";
import type { LogCategory } from "../LogSheet";
import type { TimelineEntry } from "../Timeline";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import {
  createEvent,
  deleteEvent,
  getBabyUiState,
  putBabyUiState,
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

import { TodayHeroCard } from "../today/TodayHeroCard";
import { TodayTrackerGrid } from "../today/TodayTrackerGrid";
import { TodayHealthSection } from "../today/TodayHealthSection";
import { TodayTimeline } from "../today/TodayTimeline";
import { getFeatureVariant } from "../../lib/featureFlags";

export function TodayPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist, caregivers, featureAssignments } =
    useUIBootstrap();
  const openSleepEventIdRef = useRef<string | null>(null);

  // ── seed data ──────────────────────────────────────────────
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

  // ── API events & timeline ─────────────────────────────────
  const [todayApiEvents, setTodayApiEvents] = useState<ApiEvent[] | null>(null);

  const caregiverName = useMemo(() => {
    const c = caregivers.find((x) => x.id === caregiverId);
    return c?.name?.trim() || "—";
  }, [caregivers, caregiverId]);

  const activitiesVariant = useMemo(
    () =>
      getFeatureVariant("activities_tile", featureAssignments) === "v2" ? "v2" : "v1",
    [featureAssignments],
  );
  const vitaminsVariant = useMemo(
    () =>
      getFeatureVariant("vitamins_tile", featureAssignments) === "v2" ? "v2" : "v1",
    [featureAssignments],
  );

  const icons = useMemo(() => ({
    Milk: getIcon("Milk"),
    Droplets: getIcon("Droplets"),
    Moon: getIcon("Moon"),
    Diaper: getIcon("Diaper"),
    Activity: getIcon("Activity"),
  }), []);

  const [logOpen, setLogOpen] = useState(false);
  const [logCategory, setLogCategory] = useState<LogCategory>(null);
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

  // ── data fetching ─────────────────────────────────────────
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
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
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

  // ── aggregated summaries ──────────────────────────────────
  const summaries = useMemo(() => {
    const dayYmd = formatYmd(new Date());
    const goal = resolveHydrationGoalMl(data as UIBootstrapPayload | undefined);
    if (canPersist && todayApiEvents !== null) return aggregateTodayFromApi(todayApiEvents, dayYmd, goal);
    if (data) return aggregateTodayFromSeed(data as UIBootstrapPayload);
    return emptyTodaySummaries(goal);
  }, [canPersist, todayApiEvents, data]);

  const activitySubtypeIds = useMemo(() => {
    const dayYmd = formatYmd(new Date());
    if (canPersist && todayApiEvents !== null) return collectActivitySubtypeIdsForToday(todayApiEvents, dayYmd);
    if (data) return collectActivitySubtypeIdsFromSeed(data as UIBootstrapPayload);
    return new Set<string>();
  }, [canPersist, todayApiEvents, data]);

  const activityV2Preview = useMemo(() => {
    const cats = (data?.activity_v2?.categories ?? []) as ActivityV2CategorySeed[];
    const rows = buildActivityV2PreviewRows(cats, activitySubtypeIds, 6);
    return rows.map((r) => ({ ...r, Icon: getIcon(r.icon) }));
  }, [data?.activity_v2?.categories, activitySubtypeIds]);

  // ── hydration / insight / vitamin / med sync effects ──────
  useEffect(() => {
    if (!data || canPersist) return;
    setWater(aggregateTodayFromSeed(data as UIBootstrapPayload).hydrationMl);
  }, [canPersist, data]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && todayApiEvents !== null) setWater(summaries.hydrationMl);
  }, [canPersist, todayApiEvents, summaries.hydrationMl, data]);

  useEffect(() => {
    const off = data?.today?.lastWakeOffsetMs;
    if (typeof off === "number") setLastWakeTime(new Date(Date.now() - off));
  }, [data?.today?.lastWakeOffsetMs]);

  useEffect(() => {
    if (insights.length) setInsightIdx(Math.floor(Math.random() * insights.length));
  }, [insights]);

  useEffect(() => {
    const vi = data?.today?.vitaminItems as { id: string; label: string; takenAt: string | null }[] | undefined;
    if (vi?.length) setVitaminsV2(vi);
  }, [data?.today?.vitaminItems]);

  useEffect(() => {
    const mi = data?.today?.medItems as { id: string; label: string; takenAt: string | null }[] | undefined;
    if (mi?.length) setMedsV2(mi);
  }, [data?.today?.medItems]);

  // ── handlers ──────────────────────────────────────────────
  const handleToggleVitamin = (id: string) => {
    setVitaminsV2((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, takenAt: v.takenAt ? null : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
          : v,
      ),
    );
  };

  const handleToggleMed = (id: string) => {
    setMedsV2((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, takenAt: m.takenAt ? null : new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
          : m,
      ),
    );
  };

  const openLog = (category: LogCategory = null, subType = "") => {
    setLogCategory(category);
    setLogSubType(subType);
    setLogOpen(true);
  };

  const logTypeLabels: Record<string, string> = {
    feeding: "Alimentação", hydration: "Hidratação", sleep: "Sono",
    diaper: "Fralda", activity: "Atividade", bath: "Banho", health: "Saúde",
  };

  const handleLog = async (entry: Record<string, unknown>) => {
    if (canPersist && babyId && caregiverId) {
      try {
        const day = formatYmd(new Date());
        const payload = logSheetEntryToIncoming(entry, babyId, caregiverId, day);
        await createEvent(payload);
        await reloadTodayTimeline();
        toast.success(`${logTypeLabels[entry.type as string] ?? "Registro"} salvo`);

        if (entry.type === "health" && entry.healthName) {
          try {
            const state = await getBabyUiState(babyId);
            const vitamins = (state.vitamins ?? []) as {
              id: string; name: string; dose: string; unit: string;
              history: { date: string; dose: string; notes: string }[];
              [k: string]: unknown;
            }[];
            const match = vitamins.find((v) => v.name === entry.healthName);
            if (match) {
              match.history = [
                ...(match.history || []),
                { date: day, dose: `${match.dose} ${match.unit}`, notes: String(entry.time || "") },
              ];
              await putBabyUiState(babyId, { vitamins });
            }
          } catch {
            // history update is best-effort
          }
        }
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
    if (entry.type === "hydration") setWater(water + Number(entry.quantity || 60));
    toast.success(`${logTypeLabels[entry.type as string] ?? "Registro"} salvo`);
  };

  const handleToggleSleep = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    if (canPersist && babyId && caregiverId) {
      const day = formatYmd(now);
      const ts = combineDayAndTime(day, localeTimeStringToHhMm(time));
      void (async () => {
        try {
          if (isSleeping) {
            const id = openSleepEventIdRef.current;
            if (id) { await updateEvent(id, { end_timestamp: ts }); openSleepEventIdRef.current = null; }
            setLastWakeTime(now);
          } else {
            const created = await createEvent({
              baby_id: babyId, caregiver_id: caregiverId, type: "sleep",
              subtype: "nap", timestamp: ts, notes: "Bebê dormiu", metadata: {},
            });
            openSleepEventIdRef.current = created.id;
          }
          await reloadTodayTimeline();
        } catch (e) { console.error(e); }
      })();
      setIsSleeping(!isSleeping);
      return;
    }

    if (isSleeping) {
      void handleLog({ type: "sleep", subType: "wake", time, timestamp: now, caregiver: caregiverName, notes: "Bebê acordou" });
      setLastWakeTime(now);
    } else {
      void handleLog({ type: "sleep", subType: "asleep", time, timestamp: now, caregiver: caregiverName, notes: "Bebê dormiu" });
    }
    setIsSleeping(!isSleeping);
  };

  // ── derived values ────────────────────────────────────────
  const healthTakenLocal = vitaminsV2.filter((v) => v.takenAt).length + medsV2.filter((m) => m.takenAt).length;
  const healthHeadline = canPersist && todayApiEvents !== null ? summaries.healthEventsToday : healthTakenLocal;
  const healthSlotsTotal = vitaminsV2.length + medsV2.length;
  const healthProgress = healthSlotsTotal > 0 ? Math.min(100, (healthHeadline / healthSlotsTotal) * 100) : 0;
  const hydrationMlDisplayed = !canPersist ? water : todayApiEvents !== null ? water : summaries.hydrationMl;

  const today = new Date();
  const dayName = today.toLocaleDateString("pt-BR", { weekday: "long" });
  const dateStr = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });

  // ── render ────────────────────────────────────────────────
  return (
    <div className="pb-6">
      <TodayHeroCard
        dayName={dayName}
        dateStr={dateStr}
        insight={insights[insightIdx] ?? "—"}
      />

      {/* Awake Window + Sleep toggle */}
      <div className="px-4 mb-4">
        <AwakeWindow lastWake={lastWakeTime} isSleeping={isSleeping} onToggleSleep={handleToggleSleep} />
      </div>

      {/* Tracker Cards */}
      <div className="px-4 space-y-4 mb-6">
        <TodayTrackerGrid
          summaries={summaries}
          hydrationMlDisplayed={hydrationMlDisplayed}
          quickActivities={quickActivities}
          activityV2Preview={activityV2Preview}
          activitiesVariant={activitiesVariant}
          icons={icons}
          onOpenLog={openLog}
          onNavigate={(path) => navigate(path)}
          onQuickFeeding={(type) => openLog("feeding", type)}
          onQuickActivity={(actId) => openLog("activity", actId)}
        />

        <TodayHealthSection
          healthHeadline={healthHeadline}
          healthSlotsTotal={healthSlotsTotal}
          healthProgress={healthProgress}
          quickVitamins={quickVitamins}
          quickMeds={quickMeds}
          vitaminsV2={vitaminsV2}
          medsV2={medsV2}
          vitaminsVariant={vitaminsVariant}
          caregiverName={caregiverName}
          onLog={handleLog}
          onToggleVitamin={handleToggleVitamin}
          onToggleMed={handleToggleMed}
          onOpenLog={openLog}
          onNavigate={(path) => navigate(path)}
        />
      </div>

      <TodayTimeline
        entries={entries}
        logOpen={logOpen}
        logCategory={logCategory}
        logSubType={logSubType}
        onOpenLog={openLog}
        onLogOpenChange={setLogOpen}
        onLog={handleLog}
        onEditEntry={(index) => {
          const entry = entries[index];
          if (entry) openLog(entry.type as LogCategory, entry.subType);
        }}
        onDeleteEntry={(index) => {
          const entry = entries[index];
          if (canPersist && entry?.id) {
            void (async () => {
              try { await deleteEvent(entry.id!); await reloadTodayTimeline(); }
              catch (e) { console.error(e); }
            })();
            return;
          }
          setEntries(entries.filter((_, i) => i !== index));
        }}
      />
    </div>
  );
}
