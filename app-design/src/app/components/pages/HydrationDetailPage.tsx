import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import { ArrowLeft, Droplets, Plus, Pencil, Trash2, X, Check, Minus, GlassWater, CupSoda } from "lucide-react";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { TimePeriodFilter } from "../TimePeriodFilter";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { useTimePeriodFilter, dateLabelFromTimestamp } from "../../hooks/useTimePeriodFilter";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  apiEventToHydrationEntry,
  formatYmd,
  hydrationEntryToIncoming,
  isApiEventId,
  weekDayLabelsPt,
  weekMlByDay,
} from "@/api/eventMappers";

// --- Types ---
interface HydrationEntry {
  id: string;
  date?: string;
  time: string;
  amount: number;
  type: "water" | "juice" | "tea" | "other";
  typeLabel: string;
  notes: string;
}

export function HydrationDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const drinkTypes = useMemo(
    () =>
      ((data?.catalogs?.drinkTypes ?? []) as { id: HydrationEntry["type"]; label: string; icon: string }[]).map(
        (t) => ({ ...t, Icon: getIcon(t.icon) }),
      ),
    [data?.catalogs?.drinkTypes],
  );
  const quickAmounts = useMemo(
    () => (data?.catalogs?.quickAmounts ?? []) as number[],
    [data?.catalogs?.quickAmounts],
  );
  const seedWeekData = useMemo(
    () => (data?.tracker_logs?.hydration?.weekData ?? []) as { day: string; ml: number }[],
    [data?.tracker_logs?.hydration?.weekData],
  );
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);
  const timePeriod = useTimePeriodFilter();

  const [hydApiEvents, setHydApiEvents] = useState<ApiEvent[]>([]);
  const [logs, setLogs] = useState<HydrationEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "hydration" });
    setHydApiEvents(evs);
  }, [babyId, caregiverId, canPersist]);

  useEffect(() => {
    if (!hydApiEvents.length && !canPersist) return;
    const mapped = timePeriod
      .filterEvents(hydApiEvents)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((e) => {
        const h = apiEventToHydrationEntry(e);
        const typeLabel =
          drinkTypes.find((t) => t.id === h.type)?.label || h.type;
        return {
          id: h.id,
          date: dateLabelFromTimestamp(e.timestamp),
          time: h.time,
          amount: h.amount,
          type: h.type as HydrationEntry["type"],
          typeLabel,
          notes: h.notes,
        };
      });
    setLogs(mapped);
  }, [hydApiEvents, timePeriod.filterEvents, drinkTypes, canPersist]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        const L = data.tracker_logs?.hydration?.initialLogs as HydrationEntry[] | undefined;
        if (L?.length) setLogs(L);
      });
      return;
    }
    const L = data.tracker_logs?.hydration?.initialLogs as HydrationEntry[] | undefined;
    if (L?.length) setLogs(L);
    else setLogs([]);
  }, [data, canPersist, babyId, caregiverId, refreshFromApi]);

  const weekData = useMemo(() => {
    if (canPersist && hydApiEvents.length > 0) {
      return weekMlByDay(hydApiEvents, weekLabels, new Date());
    }
    return seedWeekData;
  }, [canPersist, hydApiEvents, weekLabels, seedWeekData]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HydrationEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<HydrationEntry["type"]>("water");
  const [formTime, setFormTime] = useState("");
  const [formAmount, setFormAmount] = useState(60);
  const [formNotes, setFormNotes] = useState("");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  const [filterType, setFilterType] = useState<"all" | "water" | "other">("all");

  const goal = 500;
  const todayTotal = logs.reduce((a, b) => a + b.amount, 0);
  const progressPct = Math.min((todayTotal / goal) * 100, 100);

  const circleR = 50;
  const circleC = 2 * Math.PI * circleR;

  const waterCount = logs.filter((l) => l.type === "water").length;
  const juiceCount = logs.filter((l) => l.type === "juice" || l.type === "tea" || l.type === "other").length;

  const filteredWeekData = useMemo(() => {
    if (filterType === "all") return weekData;
    if (!canPersist || hydApiEvents.length === 0) return weekData;
    const filtered = filterType === "water"
      ? hydApiEvents.filter((e) => (e.subtype ?? "water") === "water")
      : hydApiEvents.filter((e) => (e.subtype ?? "water") !== "water");
    return weekMlByDay(filtered, weekLabels, new Date());
  }, [filterType, weekData, canPersist, hydApiEvents, weekLabels]);

  const filteredLogs = useMemo(() => {
    if (filterType === "all") return logs;
    if (filterType === "water") return logs.filter((l) => l.type === "water");
    return logs.filter((l) => l.type !== "water");
  }, [filterType, logs]);

  const chartMax = filteredWeekData.length ? Math.max(...filteredWeekData.map((d) => d.ml), 1) : 1;
  const gridStep = chartMax <= 100 ? 50 : chartMax <= 300 ? 50 : chartMax <= 600 ? 100 : 200;
  const adjustedMax = Math.max(Math.ceil(chartMax / gridStep) * gridStep, gridStep);
  const gridLines = Array.from({ length: Math.floor(adjustedMax / gridStep) }, (_, i) => (i + 1) * gridStep);

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormType("water");
    setFormTime(nowTime());
    setFormAmount(60);
    setFormNotes("");
    setFormDateYmd(todayYmd());
    setDrawerOpen(true);
  };

  const openEdit = (entry: HydrationEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = hydApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setFormDateYmd(dateYmd);
    setFormType(entry.type);
    setFormTime(entry.time);
    setFormAmount(entry.amount);
    setFormNotes(entry.notes);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const typeLabel = drinkTypes.find((t) => t.id === formType)?.label || "Água";
    const dayYmd = clampYmdNotAfterToday(formDateYmd);

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = hydrationEntryToIncoming(
            {
              type: formType,
              time: formTime,
              amount: formAmount,
              notes: formNotes,
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

        const entry: HydrationEntry = {
          id: editingEntry?.id || Date.now().toString(),
          time: formTime,
          amount: formAmount,
          type: formType,
          typeLabel,
          notes: formNotes,
        };
        if (editingEntry) {
          setLogs(logs.map((l) => (l.id === entry.id ? entry : l)));
        } else {
          setLogs([entry, ...logs].sort((a, b) => a.time.localeCompare(b.time)));
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
          setLogs(logs.filter((l) => l.id !== id));
        }
        setDeleteConfirm(null);
      } catch (e) {
        console.error(e);
      }
    })();
  };

  return (
    <div className="pb-6">
      {/* Header — same pattern as feeding */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Hidratação</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-baby-blue text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary — same grid pattern as feeding */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <button onClick={() => setFilterType("all")}>
              <div className={`w-10 h-10 rounded-full bg-baby-blue/30 flex items-center justify-center mx-auto mb-2 transition-all ${filterType !== "all" ? "opacity-40" : ""}`}>
                <Droplets className="w-5 h-5 text-baby-blue" />
              </div>
              <p className="text-2xl">{todayTotal}</p>
              <p className="text-[10px] text-muted-foreground">ml total</p>
            </button>
            <button onClick={() => setFilterType(filterType === "water" ? "all" : "water")}>
              <div className={`w-10 h-10 rounded-full bg-baby-mint/30 flex items-center justify-center mx-auto mb-2 transition-all ${filterType === "water" ? "ring-2 ring-baby-blue scale-110" : filterType !== "all" ? "opacity-40" : ""}`}>
                <GlassWater className="w-5 h-5 text-foreground/60" />
              </div>
              <p className="text-2xl">{waterCount}x</p>
              <p className="text-[10px] text-muted-foreground">água</p>
            </button>
            <button onClick={() => setFilterType(filterType === "other" ? "all" : "other")}>
              <div className={`w-10 h-10 rounded-full bg-baby-peach/30 flex items-center justify-center mx-auto mb-2 transition-all ${filterType === "other" ? "ring-2 ring-baby-blue scale-110" : filterType !== "all" ? "opacity-40" : ""}`}>
                <CupSoda className="w-5 h-5 text-foreground/60" />
              </div>
              <p className="text-2xl">{juiceCount}x</p>
              <p className="text-[10px] text-muted-foreground">outros</p>
            </button>
          </div>

          {/* Progress ring */}
          <div className="mt-5 pt-5 border-t border-border/30 flex items-center gap-4">
            <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={circleR} fill="none" stroke="currentColor" className="text-baby-blue/20" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r={circleR} fill="none" stroke="#A8D8EA" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(progressPct / 100) * circleC} ${circleC}`}
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="relative text-xs z-10">{Math.round(progressPct)}%</span>
            </div>
            <div className="flex-1">
              <p className="text-sm">{todayTotal} / {goal} ml</p>
              <p className="text-xs text-muted-foreground">Meta diária</p>
            </div>
          </div>

        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Hidratação na semana</p>
          <div className="flex gap-1">
            <div className="flex flex-col justify-between h-40 pr-1 text-[9px] text-muted-foreground w-8 shrink-0 pb-5">
              {[...gridLines].reverse().map((v) => (
                <span key={v} className="leading-none text-right">{v}</span>
              ))}
              <span className="leading-none text-right">0</span>
            </div>
            <div className="flex-1 relative h-40">
              <div className="absolute inset-0 bottom-5 rounded-lg bg-secondary/20">
                {gridLines.map((v) => (
                  <div
                    key={v}
                    className="absolute w-full border-t border-dashed border-border/40"
                    style={{ bottom: `${(v / adjustedMax) * 100}%` }}
                  />
                ))}
              </div>
              <div className="relative flex items-end justify-between gap-2 h-full pb-5">
                {filteredWeekData.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    {d.ml > 0 && (
                      <span className="text-[10px] text-foreground/60">{d.ml}</span>
                    )}
                    <div
                      className="w-full rounded-lg bg-baby-blue/60 transition-all"
                      style={{ height: `${(d.ml / adjustedMax) * 100}%`, minHeight: d.ml > 0 ? 8 : 4 }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between absolute bottom-0 w-full">
                {filteredWeekData.map((d) => (
                  <span key={`label-${d.day}`} className="flex-1 text-center text-[10px] text-muted-foreground">{d.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtered log */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <TimePeriodFilter filter={timePeriod} />
          <p className="text-sm text-muted-foreground mb-3">{timePeriod.title}</p>
          <div className="space-y-1">
            {filteredLogs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum registro neste período.</p>
            )}
            {filteredLogs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 py-2.5 group">
                <div className="text-xs text-muted-foreground w-12 pt-0.5 shrink-0">
                  {timePeriod.period !== "today" && <p className="text-[10px] font-medium">{l.date}</p>}
                  <p>{l.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{l.typeLabel}</p>
                    <span className="text-[10px] bg-baby-blue/20 text-baby-blue px-1.5 py-0.5 rounded-full">
                      {l.amount} ml
                    </span>
                  </div>
                  {l.notes && <p className="text-xs text-muted-foreground mt-0.5">{l.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(l)}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                  {deleteConfirm === l.id ? (
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-destructive" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(l.id)}
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

      {/* Add/Edit Drawer — same pattern as feeding */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">{editingEntry ? "Editar" : "Novo"} Registro de Hidratação</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>{editingEntry ? "Editar" : "Novo"} Registro</h3>
                <div className="w-5" />
              </div>

              <EventDateField value={formDateYmd} onChange={setFormDateYmd} />

              {/* Horário */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Horário</label>
                <TimePickerField value={formTime} onChange={setFormTime} />
              </div>

              {/* Tipo */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {drinkTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormType(t.id)}
                      className={`px-4 py-2.5 rounded-2xl text-xs transition-all ${
                        formType === t.id
                          ? "bg-baby-blue text-white shadow-sm"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantidade */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Quantidade (ml)</label>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <button
                    onClick={() => setFormAmount(Math.max(10, formAmount - 10))}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
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
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setFormAmount(amt)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                        formAmount === amt ? "bg-baby-blue text-white" : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {amt} ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">Observações</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Depois do almoço, depois da frutinha..."
                  rows={3}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-baby-blue text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Check className="w-4 h-4" />
                {editingEntry ? "Salvar Alterações" : "Registrar"}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}