import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { todayYmd } from "../EventDateField";
import { TrackerLogSection } from "../TrackerLogSection";
import { WeekBarChart } from "../WeekBarChart";
import { TrackerDrawer } from "../TrackerDrawer";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { useTimePeriodFilter, dateLabelFromTimestamp } from "../../hooks/useTimePeriodFilter";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  apiEventToFeedingEntry,
  feedingEntryToIncoming,
  formatYmd,
  isApiEventId,
  weekCountsByDayForType,
  weekDayLabelsPt,
} from "@/api/eventMappers";
import { FeedingSummaryCards } from "./FeedingSummaryCards";
import { FeedingForm } from "./FeedingForm";
import type {
  FoodResult,
  FeedingEntry,
  FeedingFormData,
  FeedingFilterType,
} from "./feeding.types";

export function FeedingDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const foodDB = useMemo(() => (data?.food_catalog?.foods ?? []) as FoodResult[], [data]);

  const formulaBrands = useMemo(
    () => (data?.catalogs?.formulaBrands ?? []) as string[],
    [data?.catalogs?.formulaBrands],
  );
  const feedingTypes = useMemo(
    () =>
      (data?.catalogs?.feedingTypes ?? []) as {
        id: FeedingEntry["type"];
        label: string;
      }[],
    [data?.catalogs?.feedingTypes],
  );
  const seedWeekSummary = useMemo(
    () =>
      (data?.tracker_logs?.feeding?.weekSummary ?? []) as {
        day: string;
        count: number;
      }[],
    [data?.tracker_logs?.feeding?.weekSummary],
  );
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);
  const timePeriod = useTimePeriodFilter();

  // --- API / local events state ---
  const [feedApiEvents, setFeedApiEvents] = useState<ApiEvent[]>([]);
  const [feedings, setFeedings] = useState<FeedingEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "feeding" });
    setFeedApiEvents(evs);
  }, [babyId, caregiverId, canPersist]);

  useEffect(() => {
    if (!feedApiEvents.length && !canPersist) return;
    const mapped = timePeriod
      .filterEvents(feedApiEvents)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((e) => ({
        ...(apiEventToFeedingEntry(e, feedingTypes) as FeedingEntry),
        date: dateLabelFromTimestamp(e.timestamp),
      }));
    setFeedings(mapped);
  }, [feedApiEvents, timePeriod.filterEvents, feedingTypes, canPersist]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        const init = data.tracker_logs?.feeding?.initialFeedings as FeedingEntry[] | undefined;
        if (init?.length) setFeedings(init);
      });
      return;
    }
    const init = data.tracker_logs?.feeding?.initialFeedings as FeedingEntry[] | undefined;
    if (init?.length) setFeedings(init);
    else setFeedings([]);
  }, [data, canPersist, babyId, caregiverId, refreshFromApi]);

  // --- Week chart data ---
  const weekSummary = useMemo(() => {
    if (canPersist && feedApiEvents.length > 0) {
      return weekCountsByDayForType(feedApiEvents, weekLabels, new Date(), "feeding");
    }
    return seedWeekSummary;
  }, [canPersist, feedApiEvents, weekLabels, seedWeekSummary]);

  const [filterType, setFilterType] = useState<FeedingFilterType>("all");

  const filteredWeekSummary = useMemo(() => {
    if (filterType === "all") return weekSummary;
    if (!canPersist || feedApiEvents.length === 0) return weekSummary;
    const subtypeMap: Record<string, string[]> = {
      breast: ["breast"],
      formula: ["bottle_breastmilk", "bottle_formula", "bottle"],
      solids: ["solids"],
    };
    const allowed = subtypeMap[filterType] || [];
    const filtered = feedApiEvents.filter((ev) => allowed.includes(ev.subtype || ""));
    return weekCountsByDayForType(filtered, weekLabels, new Date(), "feeding");
  }, [filterType, weekSummary, canPersist, feedApiEvents, weekLabels]);

  const filteredFeedings = useMemo(() => {
    if (filterType === "all") return feedings;
    return feedings.filter((f) => f.type === filterType);
  }, [filterType, feedings]);

  // --- Drawer state ---
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [editingEntry, setEditingEntry] = useState<FeedingEntry | null>(null);
  const [initialDate, setInitialDate] = useState(() => todayYmd());
  const openNew = () => {
    setEditingEntry(null);
    setInitialDate(todayYmd());
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const openEdit = (entry: FeedingEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = feedApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setInitialDate(dateYmd);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const handleSave = (formData: FeedingFormData) => {
    const typeLabel = feedingTypes.find((f) => f.id === formData.type)?.label || "";

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = feedingEntryToIncoming(
            {
              type: formData.type,
              time: formData.time,
              side: formData.side,
              duration: formData.duration,
              amount: formData.amount,
              formula: formData.formula,
              notes: formData.notes,
              foodName: formData.food?.name ?? null,
            },
            babyId,
            caregiverId,
            formData.dateYmd,
          );
          if (editingEntry && isApiEventId(editingEntry.id)) {
            await updateEvent(editingEntry.id, {
              subtype: incoming.subtype,
              timestamp: incoming.timestamp,
              quantity: incoming.quantity,
              unit: incoming.unit,
              notes: incoming.notes,
              metadata: incoming.metadata,
            });
          } else {
            await createEvent(incoming);
          }
          await refreshFromApi();
          setDrawerOpen(false);
          return;
        }

        const entry: FeedingEntry = {
          id: editingEntry?.id || Date.now().toString(),
          time: formData.time,
          type: formData.type,
          typeLabel,
          side: formData.type === "breast" ? formData.side : undefined,
          duration: formData.type === "breast" ? `${formData.duration} min` : undefined,
          amount: formData.type !== "breast"
            ? `${formData.amount} ${formData.type === "solids" ? "g" : "ml"}`
            : undefined,
          notes: formData.notes,
          food: formData.type === "solids" ? formData.food : null,
          formulaBrand: formData.type === "formula" ? formData.formula : undefined,
        };
        if (editingEntry) {
          setFeedings(feedings.map((f) => (f.id === entry.id ? entry : f)));
        } else {
          setFeedings([entry, ...feedings].sort((a, b) => a.time.localeCompare(b.time)));
        }
        setDrawerOpen(false);
      } catch (e) {
        console.error(e);
      }
    })();
  };

  const handleDelete = (id: string) => {
    void (async () => {
      try {
        if (canPersist && isApiEventId(id)) {
          await deleteEvent(id);
          await refreshFromApi();
        } else {
          setFeedings(feedings.filter((f) => f.id !== id));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  };

  const breastCount = feedings.filter((f) => f.type === "breast").length;
  const solidsCount = feedings.filter((f) => f.type === "solids").length;
  const totalMl = feedings
    .filter((f) => f.type === "formula")
    .reduce((acc, f) => acc + parseInt(f.amount || "0"), 0);

  return (
    <div className="pb-6">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Alimentação</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-primary text-primary-foreground w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <FeedingSummaryCards
        breastCount={breastCount}
        solidsCount={solidsCount}
        totalMl={totalMl}
        filterType={filterType}
        onFilterChange={setFilterType}
      />

      <div className="px-4 mb-4">
        <WeekBarChart
          title="Refeições na semana"
          data={filteredWeekSummary.map((d) => ({ day: d.day, value: d.count }))}
          color="bg-baby-peach/60"
          valueScale="count"
          formatValue={(v) => String(Math.round(v))}
        />
      </div>

      <TrackerLogSection
        filter={timePeriod}
        items={filteredFeedings}
        timeAccessor={(f) => ({ date: f.date, time: f.time })}
        onEdit={openEdit}
        onDelete={handleDelete}
        renderItem={(f) => (
          <>
            <div className="flex items-center gap-2">
              <p className="text-sm">{f.typeLabel}</p>
              {f.formulaBrand && (
                <span className="text-[10px] bg-baby-lavender/30 px-1.5 py-0.5 rounded-full">{f.formulaBrand}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-0.5">
              {f.side && <span className="text-xs text-muted-foreground">Lado: {f.side}</span>}
              {f.duration && <span className="text-xs text-muted-foreground">· {f.duration}</span>}
              {f.amount && <span className="text-xs text-muted-foreground">· {f.amount}</span>}
            </div>
            {f.notes && <p className="text-xs text-muted-foreground mt-0.5">{f.notes}</p>}
            {f.food && (
              <div className="bg-baby-peach/10 rounded-xl p-2 mt-1.5">
                <p className="text-[10px] text-muted-foreground mb-1">{f.food.name}</p>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span>{f.food.calories} kcal</span>
                  <span>P: {f.food.protein}g</span>
                  <span>C: {f.food.carbs}g</span>
                  <span>G: {f.food.fat}g</span>
                </div>
              </div>
            )}
            {!f.food && f.foodName && (
              <span className="text-[10px] bg-baby-peach/20 text-foreground/70 px-2 py-0.5 rounded-full mt-1 inline-block">
                {f.foodName}
              </span>
            )}
          </>
        )}
      />

      <TrackerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`${editingEntry ? "Editar" : "Nova"} Alimentação`}
      >
        <FeedingForm
          key={drawerKey}
          editingEntry={editingEntry}
          initialDate={initialDate}
          feedingTypes={feedingTypes}
          formulaBrands={formulaBrands}
          foodDB={foodDB}
          onSave={handleSave}
        />
      </TrackerDrawer>
    </div>
  );
}
