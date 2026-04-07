import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import { ArrowLeft, Bath, Thermometer, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  apiEventToBathEntry,
  bathEntryToIncoming,
  formatYmd,
  isApiEventId,
  weekCountsByDayForType,
  weekDayLabelsPt,
} from "@/api/eventMappers";

// --- Types ---
type TempType = "frio" | "morno" | "quente";

interface BathEntry {
  id: string;
  time: string;
  temp: TempType;
  tempLabel: string;
  duration: number;
  notes: string;
}

export function BathDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const tempOptions = useMemo(
    () => (data?.catalogs?.bathTemps ?? []) as { id: TempType; label: string; icon: string }[],
    [data?.catalogs?.bathTemps],
  );
  const durationOptions = useMemo(
    () => (data?.catalogs?.bathDurations ?? []) as number[],
    [data?.catalogs?.bathDurations],
  );
  const seedWeekData = useMemo(
    () => (data?.tracker_logs?.bath?.weekData ?? []) as { day: string; count: number }[],
    [data?.tracker_logs?.bath?.weekData],
  );
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);

  const [bathApiEvents, setBathApiEvents] = useState<ApiEvent[]>([]);
  const [logs, setLogs] = useState<BathEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "bath" });
    setBathApiEvents(evs);
    const todayYmd = formatYmd(new Date());
    const mapped = evs
      .filter((e) => formatYmd(new Date(e.timestamp)) === todayYmd)
      .map((e) => {
        const b = apiEventToBathEntry(e);
        const tempLabel =
          tempOptions.find((t) => t.id === (b.temp as TempType))?.label || b.temp;
        return {
          id: b.id,
          time: b.time,
          temp: b.temp as TempType,
          tempLabel,
          duration: b.duration,
          notes: b.notes,
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
    setLogs(mapped);
  }, [babyId, caregiverId, canPersist, tempOptions]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        const L = data.tracker_logs?.bath?.initialLogs as BathEntry[] | undefined;
        if (L?.length) setLogs(L);
      });
      return;
    }
    const L = data.tracker_logs?.bath?.initialLogs as BathEntry[] | undefined;
    if (L?.length) setLogs(L);
    else setLogs([]);
  }, [data, canPersist, babyId, caregiverId, refreshFromApi]);

  const weekData = useMemo(() => {
    if (canPersist && bathApiEvents.length > 0) {
      return weekCountsByDayForType(bathApiEvents, weekLabels, new Date(), "bath");
    }
    return seedWeekData;
  }, [canPersist, bathApiEvents, weekLabels, seedWeekData]);

  const maxCount = weekData.length ? Math.max(...weekData.map((d) => d.count), 1) : 1;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BathEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTime, setFormTime] = useState("");
  const [formTemp, setFormTemp] = useState<TempType>("morno");
  const [formDuration, setFormDuration] = useState(15);
  const [formNotes, setFormNotes] = useState("");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  // Computed
  const totalToday = logs.length;
  const avgDuration = totalToday > 0 ? Math.round(logs.reduce((s, l) => s + l.duration, 0) / totalToday) : 0;
  const preferredTemp = (() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => { counts[l.tempLabel] = (counts[l.tempLabel] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  })();

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormTime(nowTime());
    setFormTemp("morno");
    setFormDuration(15);
    setFormNotes("");
    setFormDateYmd(todayYmd());
    setDrawerOpen(true);
  };

  const openEdit = (entry: BathEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = bathApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setFormDateYmd(dateYmd);
    setFormTime(entry.time);
    setFormTemp(entry.temp);
    setFormDuration(entry.duration);
    setFormNotes(entry.notes);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const tempLabel = tempOptions.find((t) => t.id === formTemp)?.label || "Morno";
    const dayYmd = clampYmdNotAfterToday(formDateYmd);

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = bathEntryToIncoming(
            {
              time: formTime,
              temp: formTemp,
              duration: formDuration,
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

        const entry: BathEntry = {
          id: editingEntry?.id || Date.now().toString(),
          time: formTime,
          temp: formTemp,
          tempLabel,
          duration: formDuration,
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
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Banho</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-baby-blue text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 text-center">
          <div className="w-16 h-16 rounded-full bg-baby-blue/30 flex items-center justify-center mx-auto mb-3">
            <Bath className="w-8 h-8 text-baby-blue" />
          </div>
          <p className="text-3xl">{totalToday}</p>
          <p className="text-xs text-muted-foreground">banho{totalToday !== 1 ? "s" : ""} hoje</p>
          <div className="flex justify-center gap-6 mt-4">
            <div>
              <p className="text-lg">{avgDuration} min</p>
              <p className="text-[10px] text-muted-foreground">duração média</p>
            </div>
            <div className="flex flex-col items-center">
              <Thermometer className="w-5 h-5 text-baby-blue mb-0.5" />
              <p className="text-[10px] text-muted-foreground">{preferredTemp.toLowerCase()} preferido</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Banhos na semana</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg bg-baby-blue/60 transition-all"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: 8 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's log */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Registros de hoje</p>
          <div className="space-y-1">
            {logs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum registro ainda. Toque em + para adicionar.</p>
            )}
            {logs.map((l) => (
              <div key={l.id} className="flex items-start gap-3 py-2.5 group">
                <span className="text-xs text-muted-foreground w-10 pt-1 shrink-0">{l.time}</span>
                <div className="w-8 h-8 rounded-full bg-baby-blue/40 flex items-center justify-center shrink-0">
                  <Thermometer className="w-4 h-4 text-foreground/60" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{l.tempLabel}</p>
                    <span className="text-xs text-muted-foreground">{l.duration} min</span>
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

      {/* Add/Edit Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">{editingEntry ? "Editar" : "Novo"} Banho</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>{editingEntry ? "Editar" : "Novo"} Banho</h3>
                <div className="w-5" />
              </div>

              <EventDateField value={formDateYmd} onChange={setFormDateYmd} />

              {/* Horário */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Horário</label>
                <TimePickerField value={formTime} onChange={setFormTime} />
              </div>

              {/* Temperatura */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Temperatura</label>
                <div className="flex gap-2">
                  {tempOptions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormTemp(t.id)}
                      className={`flex-1 py-3 rounded-2xl text-xs transition-all flex flex-col items-center gap-1 ${
                        formTemp === t.id
                          ? "bg-baby-blue text-white shadow-sm"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      <Thermometer className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duração */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Duração (min)</label>
                <div className="flex gap-2 flex-wrap">
                  {durationOptions.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFormDuration(d)}
                      className={`px-4 py-2.5 rounded-2xl text-xs transition-all ${
                        formDuration === d
                          ? "bg-baby-blue text-white shadow-sm"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {d}
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
                  placeholder="Ex: Banho relaxante, lavou cabelo..."
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
