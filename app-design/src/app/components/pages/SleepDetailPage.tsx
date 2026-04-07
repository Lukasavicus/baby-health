import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, Baby, Armchair, Moon, Sun } from "lucide-react";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  apiEventToSleepEntry,
  formatYmd,
  isApiEventId,
  sleepEntryToIncoming,
  weekDayLabelsPt,
  weekHoursByDay,
} from "@/api/eventMappers";

// --- Types ---
interface SleepEntry {
  id: string;
  type: "night" | "nap";
  typeLabel: string;
  start: string;
  end: string;
  location: string;
  notes: string;
}

function calcDurationMin(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60; // overnight
  return diff;
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export function SleepDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const sleepTypes = useMemo(
    () =>
      ((data?.catalogs?.sleepTypes ?? []) as { id: SleepEntry["type"]; label: string; icon: string }[]).map(
        (t) => ({ ...t, Icon: getIcon(t.icon) }),
      ),
    [data?.catalogs?.sleepTypes],
  );
  const locations = useMemo(
    () => (data?.catalogs?.sleepLocations ?? []) as string[],
    [data?.catalogs?.sleepLocations],
  );
  const seedWeekData = useMemo(
    () => (data?.tracker_logs?.sleep?.weekData ?? []) as { day: string; hours: number }[],
    [data?.tracker_logs?.sleep?.weekData],
  );
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);

  const [sleepApiEvents, setSleepApiEvents] = useState<ApiEvent[]>([]);
  const [logs, setLogs] = useState<SleepEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "sleep" });
    setSleepApiEvents(evs);
    const todayYmd = formatYmd(new Date());
    const todayLogs = evs
      .filter((e) => formatYmd(new Date(e.timestamp)) === todayYmd)
      .map(apiEventToSleepEntry)
      .sort((a, b) => a.start.localeCompare(b.start));
    setLogs(todayLogs);
  }, [babyId, caregiverId, canPersist]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        const L = data.tracker_logs?.sleep?.initialLogs as SleepEntry[] | undefined;
        if (L?.length) setLogs(L);
      });
      return;
    }
    const L = data.tracker_logs?.sleep?.initialLogs as SleepEntry[] | undefined;
    if (L?.length) setLogs(L);
    else setLogs([]);
  }, [data, canPersist, babyId, caregiverId, refreshFromApi]);

  const weekData = useMemo(() => {
    if (canPersist && sleepApiEvents.length > 0) {
      return weekHoursByDay(sleepApiEvents, weekLabels, new Date());
    }
    return seedWeekData;
  }, [canPersist, sleepApiEvents, weekLabels, seedWeekData]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<SleepEntry["type"]>("nap");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formLocation, setFormLocation] = useState("Berço");
  const [formNotes, setFormNotes] = useState("");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  // Computed summaries
  const nightMin = logs.filter((l) => l.type === "night").reduce((s, l) => s + calcDurationMin(l.start, l.end), 0);
  const napMin = logs.filter((l) => l.type === "nap").reduce((s, l) => s + calcDurationMin(l.start, l.end), 0);
  const totalMin = nightMin + napMin;
  const maxH = weekData.length ? Math.max(...weekData.map((d) => d.hours), 0.1) : 1;

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormType("nap");
    setFormStart(nowTime());
    setFormEnd(nowTime());
    setFormLocation("Berço");
    setFormNotes("");
    setFormDateYmd(todayYmd());
    setDrawerOpen(true);
  };

  const openEdit = (entry: SleepEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = sleepApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setFormDateYmd(dateYmd);
    setFormType(entry.type);
    setFormStart(entry.start);
    setFormEnd(entry.end);
    setFormLocation(entry.location);
    setFormNotes(entry.notes);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const typeLabel = sleepTypes.find((t) => t.id === formType)?.label || "Cochilo";
    const dayYmd = clampYmdNotAfterToday(formDateYmd);

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = sleepEntryToIncoming(
            {
              type: formType,
              start: formStart,
              end: formEnd,
              location: formLocation,
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
              end_timestamp: incoming.end_timestamp ?? null,
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

        const entry: SleepEntry = {
          id: editingEntry?.id || Date.now().toString(),
          type: formType,
          typeLabel,
          start: formStart,
          end: formEnd,
          location: formLocation,
          notes: formNotes,
        };
        if (editingEntry) {
          setLogs(logs.map((l) => (l.id === entry.id ? entry : l)));
        } else {
          setLogs([entry, ...logs].sort((a, b) => a.start.localeCompare(b.start)));
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
          <h2>Sono</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-baby-lavender text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-baby-lavender/20 rounded-2xl p-4 text-center">
              <Moon className="w-5 h-5 text-baby-lavender mx-auto mb-2" />
              <p className="text-2xl">{formatDuration(nightMin)}</p>
              <p className="text-[10px] text-muted-foreground">sono noturno</p>
            </div>
            <div className="bg-baby-blue/20 rounded-2xl p-4 text-center">
              <Sun className="w-5 h-5 text-baby-blue mx-auto mb-2" />
              <p className="text-2xl">{formatDuration(napMin)}</p>
              <p className="text-[10px] text-muted-foreground">cochilos</p>
            </div>
          </div>
          <div className="mt-4 bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-sm">Total: <span className="text-baby-lavender">{formatDuration(totalMin)}</span></p>
            <p className="text-[10px] text-muted-foreground">Recomendado para 8 meses: 12–15h</p>
          </div>
        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Sono na semana (horas)</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg bg-baby-lavender/60 transition-all"
                  style={{ height: `${(d.hours / maxH) * 100}%`, minHeight: 8 }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's log — same pattern as feeding/hydration */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Registros de hoje</p>
          <div className="space-y-1">
            {logs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum registro ainda. Toque em + para adicionar.</p>
            )}
            {logs.map((l) => {
              const dur = calcDurationMin(l.start, l.end);
              return (
                <div key={l.id} className="flex items-start gap-3 py-2.5 group">
                  <span className="text-xs text-muted-foreground w-10 pt-0.5 shrink-0">{l.start}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{l.typeLabel}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        l.type === "night" ? "bg-baby-lavender/20 text-baby-lavender" : "bg-baby-blue/20 text-baby-blue"
                      }`}>
                        {formatDuration(dur)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {l.start} – {l.end} · {l.location}
                    </p>
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
              );
            })}
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
            <Drawer.Title className="sr-only">{editingEntry ? "Editar" : "Novo"} Registro de Sono</Drawer.Title>
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

              {/* Tipo */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Tipo</label>
                <div className="flex gap-2">
                  {sleepTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormType(t.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs transition-all ${
                        formType === t.id
                          ? t.id === "night" ? "bg-baby-lavender text-white shadow-sm" : "bg-baby-blue text-white shadow-sm"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      <t.Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Início */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Início</label>
                <TimePickerField value={formStart} onChange={setFormStart} />
              </div>

              {/* Fim */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Fim</label>
                <TimePickerField value={formEnd} onChange={setFormEnd} />
              </div>

              {/* Duração calculada */}
              {formStart && formEnd && (
                <div className="mb-5 bg-secondary/50 rounded-2xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="text-lg">{formatDuration(calcDurationMin(formStart, formEnd))}</p>
                </div>
              )}

              {/* Local */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Local</label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setFormLocation(loc)}
                      className={`px-4 py-2.5 rounded-2xl text-xs transition-all ${
                        formLocation === loc
                          ? "bg-baby-lavender text-white shadow-sm"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {loc}
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
                  placeholder="Ex: Acordou uma vez, dormiu bem..."
                  rows={3}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-baby-lavender text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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
