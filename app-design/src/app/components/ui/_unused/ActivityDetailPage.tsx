import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import { ArrowLeft, Activity, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { TimePeriodFilter } from "../TimePeriodFilter";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { useTimePeriodFilter, dateLabelFromTimestamp } from "../../hooks/useTimePeriodFilter";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  activityEntryToIncoming,
  apiEventToActivityEntry,
  formatYmd,
  isApiEventId,
  weekDayLabelsPt,
  weekMinutesByDay,
} from "@/api/eventMappers";

// --- Types ---
type ActivityType = "tummy" | "reading" | "music" | "play" | "walk" | "visual" | "auditory" | "spatial";

interface ActivityEntry {
  id: string;
  date?: string;
  time: string;
  type: ActivityType;
  label: string;
  duration: number;
  notes: string;
}

export function ActivityDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const activityOptions = useMemo(
    () =>
      ((data?.catalogs?.activityOptions ?? []) as { id: ActivityType; label: string; icon: string }[]).map(
        (a) => ({ ...a, Icon: getIcon(a.icon) }),
      ),
    [data?.catalogs?.activityOptions],
  );
  const activityIcons = useMemo(
    () => Object.fromEntries(activityOptions.map((a) => [a.id, a.Icon])),
    [activityOptions],
  );
  const durationOptions = useMemo(
    () => (data?.catalogs?.activityDurationOptions ?? []) as number[],
    [data?.catalogs?.activityDurationOptions],
  );
  const seedWeekData = useMemo(
    () => (data?.tracker_logs?.activity?.weekData ?? []) as { day: string; min: number }[],
    [data?.tracker_logs?.activity?.weekData],
  );
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);
  const timePeriod = useTimePeriodFilter();

  const [actApiEvents, setActApiEvents] = useState<ApiEvent[]>([]);
  const [logs, setLogs] = useState<ActivityEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "activity" });
    setActApiEvents(evs);
  }, [babyId, caregiverId, canPersist]);

  useEffect(() => {
    if (!actApiEvents.length && !canPersist) return;
    const mapped = timePeriod
      .filterEvents(actApiEvents)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((e) => {
        const a = apiEventToActivityEntry(e);
        return {
          id: a.id,
          date: dateLabelFromTimestamp(e.timestamp),
          time: a.time,
          type: a.type as ActivityType,
          label: activityOptions.find((o) => o.id === (a.type as ActivityType))?.label || a.type,
          duration: a.duration,
          notes: a.notes,
        };
      });
    setLogs(mapped);
  }, [actApiEvents, timePeriod.filterEvents, activityOptions, canPersist]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        const L = data.tracker_logs?.activity?.initialLogs as ActivityEntry[] | undefined;
        if (L?.length) setLogs(L);
      });
      return;
    }
    const L = data.tracker_logs?.activity?.initialLogs as ActivityEntry[] | undefined;
    if (L?.length) setLogs(L);
    else setLogs([]);
  }, [data, canPersist, babyId, caregiverId, refreshFromApi]);

  const weekData = useMemo(() => {
    if (canPersist && actApiEvents.length > 0) {
      return weekMinutesByDay(actApiEvents, weekLabels, new Date());
    }
    return seedWeekData;
  }, [canPersist, actApiEvents, weekLabels, seedWeekData]);

  const maxMin = weekData.length ? Math.max(...weekData.map((d) => d.min), 1) : 1;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formTime, setFormTime] = useState("");
  const [formType, setFormType] = useState<ActivityType>("tummy");
  const [formDuration, setFormDuration] = useState(15);
  const [formNotes, setFormNotes] = useState("");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  // Computed
  const totalMin = logs.reduce((s, l) => s + l.duration, 0);
  const sessionCount = logs.length;
  const uniqueTypes = new Set(logs.map((l) => l.type)).size;

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormTime(nowTime());
    setFormType("tummy");
    setFormDuration(15);
    setFormNotes("");
    setFormDateYmd(todayYmd());
    setDrawerOpen(true);
  };

  const openEdit = (entry: ActivityEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = actApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setFormDateYmd(dateYmd);
    setFormTime(entry.time);
    setFormType(entry.type);
    setFormDuration(entry.duration);
    setFormNotes(entry.notes);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const label = activityOptions.find((a) => a.id === formType)?.label || "Atividade";
    const dayYmd = clampYmdNotAfterToday(formDateYmd);

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = activityEntryToIncoming(
            {
              time: formTime,
              type: formType,
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

        const entry: ActivityEntry = {
          id: editingEntry?.id || Date.now().toString(),
          time: formTime,
          type: formType,
          label,
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
          <h2>Atividades</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-baby-mint text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 text-center">
          <p className="text-4xl text-baby-mint mb-1">{totalMin} min</p>
          <p className="text-xs text-muted-foreground">estimulação total hoje</p>
          <div className="flex justify-center gap-6 mt-4">
            <div>
              <p className="text-lg">{sessionCount}</p>
              <p className="text-[10px] text-muted-foreground">sessões</p>
            </div>
            <div>
              <p className="text-lg">{uniqueTypes}</p>
              <p className="text-[10px] text-muted-foreground">tipos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Minutos de atividade na semana</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-lg bg-baby-mint/60 transition-all"
                  style={{ height: `${(d.min / maxMin) * 100}%`, minHeight: 8 }}
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
            {logs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum registro neste período.</p>
            )}
            {logs.map((l) => {
              const Icon = activityIcons[l.type] || Activity;
              return (
                <div key={l.id} className="flex items-start gap-3 py-2.5 group">
                  <div className="text-xs text-muted-foreground w-12 shrink-0 pt-1">
                    {timePeriod.period !== "today" && <p className="text-[10px] font-medium">{l.date}</p>}
                    <p>{l.time}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-baby-mint/40 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-foreground/60" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{l.label}</p>
                      <span className="text-xs text-muted-foreground">{l.duration} min</span>
                    </div>
                    {l.notes && <p className="text-xs text-muted-foreground">{l.notes}</p>}
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
            <Drawer.Title className="sr-only">{editingEntry ? "Editar" : "Nova"} Atividade</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>{editingEntry ? "Editar" : "Nova"} Atividade</h3>
                <div className="w-5" />
              </div>

              <EventDateField value={formDateYmd} onChange={setFormDateYmd} />

              {/* Horário */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Horário</label>
                <TimePickerField value={formTime} onChange={setFormTime} />
              </div>

              {/* Tipo de atividade */}
              <div className="mb-5">
                <label className="text-xs text-muted-foreground mb-2 block">Tipo de Atividade</label>
                <div className="grid grid-cols-4 gap-2">
                  {activityOptions.map((a) => {
                    const Icon = a.Icon;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setFormType(a.id)}
                        className={`py-3 rounded-2xl text-[11px] transition-all flex flex-col items-center gap-1.5 ${
                          formType === a.id
                            ? "bg-baby-mint text-white shadow-sm"
                            : "bg-secondary text-foreground/60"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {a.label}
                      </button>
                    );
                  })}
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
                          ? "bg-baby-mint text-white shadow-sm"
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
                  placeholder="Ex: Brincou com blocos, 2 livros..."
                  rows={3}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-baby-mint text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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
