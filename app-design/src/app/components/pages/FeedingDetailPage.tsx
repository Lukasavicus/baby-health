import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import {
  ArrowLeft, Milk, Apple, CupSoda, Plus, Pencil, Trash2, X, Check,
  Search, Loader2, Minus, FlaskConical, Clock,
} from "lucide-react";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { TimePeriodFilter } from "../TimePeriodFilter";
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

interface FoodResult {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// --- Types ---
interface FeedingEntry {
  id: string;
  date?: string;
  time: string;
  type: "breast" | "bottle" | "formula" | "solids";
  typeLabel: string;
  side?: string;
  duration?: string;
  amount?: string;
  notes?: string;
  food?: FoodResult | null;
  foodName?: string;
  formulaBrand?: string;
}

export function FeedingDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const foodDB = useMemo(() => (data?.food_catalog?.foods ?? []) as FoodResult[], [data]);

  const searchFoods = useCallback(
    async (query: string): Promise<FoodResult[]> => {
      await new Promise((r) => setTimeout(r, 600));
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return foodDB.filter((f) => f.name.toLowerCase().includes(q));
    },
    [foodDB],
  );

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

  const weekSummary = useMemo(() => {
    if (canPersist && feedApiEvents.length > 0) {
      return weekCountsByDayForType(feedApiEvents, weekLabels, new Date(), "feeding");
    }
    return seedWeekSummary;
  }, [canPersist, feedApiEvents, weekLabels, seedWeekSummary]);

  const maxCount = weekSummary.length ? Math.max(...weekSummary.map((d) => d.count), 1) : 1;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FeedingEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<FeedingEntry["type"]>("breast");
  const [formTime, setFormTime] = useState("");
  const [formSide, setFormSide] = useState("");
  const [formDuration, setFormDuration] = useState(10);
  const [formAmount, setFormAmount] = useState(120);
  const [formNotes, setFormNotes] = useState("");
  const [formFood, setFormFood] = useState<FoodResult | null>(null);
  const [formFormula, setFormFormula] = useState("");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  // Food search
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState<FoodResult[]>([]);
  const [foodSearching, setFoodSearching] = useState(false);

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormType("breast");
    setFormTime(nowTime());
    setFormSide("");
    setFormDuration(10);
    setFormAmount(120);
    setFormNotes("");
    setFormFood(null);
    setFormFormula("");
    setFoodQuery("");
    setFoodResults([]);
    setFormDateYmd(todayYmd());
    setDrawerOpen(true);
  };

  const openEdit = (entry: FeedingEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = feedApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setFormDateYmd(dateYmd);
    setFormType(entry.type);
    setFormTime(entry.time);
    setFormSide(entry.side || "");
    setFormDuration(parseInt(entry.duration || "10"));
    setFormAmount(parseInt(entry.amount || "120"));
    setFormNotes(entry.notes || "");
    setFormFood(entry.food || null);
    setFormFormula(entry.formulaBrand || "");
    setFoodQuery(entry.food?.name || "");
    setFoodResults([]);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const typeLabel = feedingTypes.find((f) => f.id === formType)?.label || "";
    const dayYmd = clampYmdNotAfterToday(formDateYmd);

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = feedingEntryToIncoming(
            {
              type: formType,
              time: formTime,
              side: formSide,
              duration: formDuration,
              amount: formAmount,
              formula: formFormula,
              notes: formNotes,
              foodName: formFood?.name ?? null,
            },
            babyId,
            caregiverId,
            dayYmd,
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
          time: formTime,
          type: formType,
          typeLabel,
          side: formType === "breast" ? formSide : undefined,
          duration: formType === "breast" ? `${formDuration} min` : undefined,
          amount: formType !== "breast" ? `${formAmount} ${formType === "solids" ? "g" : "ml"}` : undefined,
          notes: formNotes,
          food: formType === "solids" ? formFood : null,
          formulaBrand: formType === "formula" ? formFormula : undefined,
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
        setDeleteConfirm(null);
      } catch (e) {
        console.error(e);
      }
    })();
  };

  const handleFoodSearch = async (q: string) => {
    setFoodQuery(q);
    if (q.length < 2) { setFoodResults([]); return; }
    setFoodSearching(true);
    const results = await searchFoods(q);
    setFoodResults(results);
    setFoodSearching(false);
  };

  const breastCount = feedings.filter((f) => f.type === "breast" || f.type === "bottle").length;
  const solidsCount = feedings.filter((f) => f.type === "solids").length;
  const totalMl = feedings
    .filter((f) => f.type === "bottle" || f.type === "formula")
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

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-baby-peach/40 flex items-center justify-center mx-auto mb-2">
                <Milk className="w-5 h-5 text-foreground/60" />
              </div>
              <p className="text-2xl">{breastCount}x</p>
              <p className="text-[10px] text-muted-foreground">leite</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-baby-mint/40 flex items-center justify-center mx-auto mb-2">
                <Apple className="w-5 h-5 text-foreground/60" />
              </div>
              <p className="text-2xl">{solidsCount}x</p>
              <p className="text-[10px] text-muted-foreground">sólidos</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-baby-blue/40 flex items-center justify-center mx-auto mb-2">
                <CupSoda className="w-5 h-5 text-foreground/60" />
              </div>
              <p className="text-2xl">{totalMl}</p>
              <p className="text-[10px] text-muted-foreground">ml total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Refeições na semana</p>
          <div className="flex items-end justify-between gap-2 h-28">
            {weekSummary.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                {d.count > 0 && (
                  <span className="text-[10px] text-foreground/60">{d.count}</span>
                )}
                <div
                  className="w-full rounded-lg bg-baby-peach/60 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: 8 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtered log */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <TimePeriodFilter filter={timePeriod} />
          <p className="text-sm text-muted-foreground mb-3">{timePeriod.title}</p>
          <div className="space-y-1">
            {feedings.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum registro neste período.</p>
            )}
            {feedings.map((f) => (
              <div key={f.id} className="flex items-start gap-3 py-2.5 group">
                <div className="text-xs text-muted-foreground w-12 pt-0.5 shrink-0">
                  {timePeriod.period !== "today" && <p className="text-[10px] font-medium">{f.date}</p>}
                  <p>{f.time}</p>
                </div>
                <div className="flex-1 min-w-0">
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
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(f)}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  {deleteConfirm === f.id ? (
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-destructive" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(f.id)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">{editingEntry ? "Editar" : "Nova"} Alimentação</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>{editingEntry ? "Editar" : "Nova"} Alimentação</h3>
                <div className="w-5" />
              </div>

              <EventDateField value={formDateYmd} onChange={setFormDateYmd} />

              {/* Time */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
                <TimePickerField
                  value={formTime}
                  onChange={(time) => setFormTime(time)}
                  className="w-full bg-secondary rounded-xl p-3 text-sm outline-none"
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Tipo</p>
                <div className="flex flex-wrap gap-2">
                  {feedingTypes.map((ft) => (
                    <button
                      key={ft.id}
                      onClick={() => setFormType(ft.id)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        formType === ft.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breast-specific */}
              {formType === "breast" && (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Lado</p>
                    <div className="flex gap-2">
                      {["Esquerdo", "Direito", "Ambos"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setFormSide(s)}
                          className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${
                            formSide === s
                              ? "bg-baby-peach text-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Duração (min)</p>
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        onClick={() => setFormDuration(Math.max(1, formDuration - 1))}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={formDuration}
                        onChange={(e) => setFormDuration(Math.max(1, Number(e.target.value) || 1))}
                        className="text-3xl w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => setFormDuration(formDuration + 1)}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Bottle / Formula quantity */}
              {(formType === "bottle" || formType === "formula") && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Quantidade (ml)</p>
                  <div className="flex items-center gap-4 justify-center">
                    <button
                      onClick={() => setFormAmount(Math.max(0, formAmount - 30))}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={formAmount}
                      onChange={(e) => setFormAmount(Math.max(0, Number(e.target.value) || 0))}
                      className="text-3xl w-20 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setFormAmount(formAmount + 30)}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Formula brand */}
              {formType === "formula" && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Marca da fórmula</p>
                  <div className="flex flex-wrap gap-2">
                    {formulaBrands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setFormFormula(brand)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                          formFormula === brand
                            ? "bg-baby-lavender text-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                  {formFormula === "Outra" && (
                    <input
                      type="text"
                      placeholder="Nome da fórmula..."
                      className="w-full bg-secondary rounded-xl p-3 text-sm outline-none mt-2"
                      onChange={(e) => setFormFormula(e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* Solids - food search */}
              {formType === "solids" && (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Quantidade (g)</p>
                    <div className="flex items-center gap-4 justify-center">
                      <button
                        onClick={() => setFormAmount(Math.max(0, formAmount - 10))}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={formAmount}
                        onChange={(e) => setFormAmount(Math.max(0, Number(e.target.value) || 0))}
                        className="text-3xl w-20 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => setFormAmount(formAmount + 10)}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1.5">
                      <FlaskConical className="w-3.5 h-3.5 inline mr-1" />
                      Buscar alimento (FatSecret API)
                    </p>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={foodQuery}
                        onChange={(e) => handleFoodSearch(e.target.value)}
                        placeholder="Ex: sopa de abóbora, papinha de maçã..."
                        className="w-full bg-secondary rounded-xl p-3 pl-9 text-sm outline-none"
                      />
                      {foodSearching && (
                        <Loader2 className="absolute right-3 top-3 w-4 h-4 text-muted-foreground animate-spin" />
                      )}
                    </div>

                    {/* Search results */}
                    {foodResults.length > 0 && (
                      <div className="mt-2 bg-secondary/50 rounded-xl overflow-hidden">
                        {foodResults.map((food) => (
                          <button
                            key={food.id}
                            onClick={() => {
                              setFormFood(food);
                              setFoodQuery(food.name);
                              setFoodResults([]);
                            }}
                            className={`w-full text-left p-3 border-b border-border/30 last:border-0 transition-colors ${
                              formFood?.id === food.id ? "bg-baby-peach/20" : "hover:bg-secondary"
                            }`}
                          >
                            <p className="text-sm">{food.name}</p>
                            <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                              <span>{food.calories} kcal</span>
                              <span>P: {food.protein}g</span>
                              <span>C: {food.carbs}g</span>
                              <span>G: {food.fat}g</span>
                              <span>Fibra: {food.fiber}g</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected food nutrition card */}
                    {formFood && (
                      <div className="mt-3 bg-baby-peach/10 border border-baby-peach/20 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm">{formFood.name}</p>
                          <button
                            onClick={() => { setFormFood(null); setFoodQuery(""); }}
                            className="text-xs text-muted-foreground"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-center">
                          <div>
                            <p className="text-sm text-baby-peach">{formFood.calories}</p>
                            <p className="text-[9px] text-muted-foreground">kcal</p>
                          </div>
                          <div>
                            <p className="text-sm">{formFood.protein}g</p>
                            <p className="text-[9px] text-muted-foreground">proteína</p>
                          </div>
                          <div>
                            <p className="text-sm">{formFood.carbs}g</p>
                            <p className="text-[9px] text-muted-foreground">carbs</p>
                          </div>
                          <div>
                            <p className="text-sm">{formFood.fat}g</p>
                            <p className="text-[9px] text-muted-foreground">gordura</p>
                          </div>
                          <div>
                            <p className="text-sm">{formFood.fiber}g</p>
                            <p className="text-[9px] text-muted-foreground">fibra</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                          Dados via FatSecret API · valores por 100g
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Notes */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Notas</p>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Adicionar nota..."
                  className="w-full bg-secondary rounded-xl p-3 text-sm resize-none h-20 outline-none"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Check className="w-5 h-5" />
                {editingEntry ? "Salvar alterações" : "Registrar"}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}