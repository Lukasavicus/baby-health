import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Check,
  Star,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { TrackerDrawer } from "../TrackerDrawer";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { WeekBarChart } from "../WeekBarChart";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  activityEntryToIncoming,
  apiEventToActivityEntryV2,
  formatYmd,
  isApiEventId,
  weekDayLabelsPt,
  weekMinutesByDay,
} from "@/api/eventMappers";

// --- Types from API seed (activity_v2) ---

interface ActivityOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface ActivityCategory {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  activities: ActivityOption[];
}

import type { ActivityEntry } from "@/types/trackers";

export function ActivityDetailPageV2() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();
  const av2 = data?.activity_v2;

  const activityCategories: ActivityCategory[] = useMemo(() => {
    const cats = av2?.categories ?? [];
    return cats.map((cat) => ({
      id: cat.id,
      label: cat.label,
      color: cat.color,
      bgColor: cat.bgColor,
      icon: getIcon(cat.icon),
      activities: (cat.activities ?? []).map((a) => ({
        id: a.id,
        label: a.label,
        description: a.description,
        icon: getIcon(a.icon),
      })),
    }));
  }, [av2?.categories]);

  const allActivities = useMemo(
    () => activityCategories.flatMap((c) => c.activities),
    [activityCategories],
  );
  const activityIconMap = useMemo(
    () => Object.fromEntries(allActivities.map((a) => [a.id, a.icon])),
    [allActivities],
  );
  const activityLabelMap = useMemo(
    () => Object.fromEntries(allActivities.map((a) => [a.id, a.label])),
    [allActivities],
  );

  const durationOptions = useMemo(
    () => av2?.durationOptions ?? [5, 10, 15, 20, 30, 45, 60],
    [av2?.durationOptions],
  );
  const seedWeekData = useMemo(() => av2?.weekData ?? [], [av2?.weekData]);
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);

  const [actApiEvents, setActApiEvents] = useState<ApiEvent[]>([]);
  const [logs, setLogs] = useState<ActivityEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "activity" });
    setActApiEvents(evs);
    const todayYmd = formatYmd(new Date());
    const mapped = evs
      .filter((e) => formatYmd(new Date(e.timestamp)) === todayYmd)
      .map((e) => apiEventToActivityEntryV2(e, activityLabelMap))
      .sort((a, b) => a.time.localeCompare(b.time));
    setLogs(mapped);
  }, [babyId, caregiverId, canPersist, activityLabelMap]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        if (av2?.initialLogs?.length) setLogs(av2.initialLogs as ActivityEntry[]);
      });
      return;
    }
    if (av2?.initialLogs?.length) setLogs(av2.initialLogs as ActivityEntry[]);
    else setLogs([]);
  }, [data, av2?.initialLogs, canPersist, babyId, caregiverId, refreshFromApi]);

  const weekData = useMemo(() => {
    if (canPersist && actApiEvents.length > 0) {
      return weekMinutesByDay(actApiEvents, weekLabels, new Date());
    }
    return seedWeekData;
  }, [canPersist, actApiEvents, weekLabels, seedWeekData]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ActivityEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (av2?.defaultFavoriteActivityIds?.length) {
      setFavorites(new Set(av2.defaultFavoriteActivityIds));
    }
  }, [data]);

  // Form state
  const [formTime, setFormTime] = useState("");
  const [formType, setFormType] = useState("tummy_time");
  const [formDuration, setFormDuration] = useState(15);
  const [formNotes, setFormNotes] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formStep, setFormStep] = useState<"select" | "details">("select");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  // Computed
  const totalMin = logs.reduce((s, l) => s + l.duration, 0);
  const sessionCount = logs.length;
  const uniqueTypes = new Set(logs.map((l) => l.type)).size;
  const categoriesUsed = new Set(
    logs.map((l) => {
      for (const cat of activityCategories) {
        if (cat.activities.some((a) => a.id === l.type)) return cat.id;
      }
      return "other";
    })
  ).size;

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormTime(nowTime());
    setFormType("tummy_time");
    setFormDuration(15);
    setFormNotes("");
    setFormStep("select");
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
    setFormStep("details");
    setDrawerOpen(true);
  };

  const handleSelectActivity = (actId: string) => {
    setFormType(actId);
    setFormStep("details");
  };

  const toggleFavorite = (actId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(actId)) next.delete(actId);
      else next.add(actId);
      return next;
    });
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const handleSave = () => {
    const label = activityLabelMap[formType] || "Atividade";
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

  const favoriteActivities = allActivities.filter((a) => favorites.has(a.id));

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Atividades (V2)</h2>
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
            <div>
              <p className="text-lg">{categoriesUsed}</p>
              <p className="text-[10px] text-muted-foreground">áreas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Development areas touched today */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Áreas estimuladas hoje</p>
          <div className="flex flex-wrap gap-2">
            {activityCategories.map((cat) => {
              const used = logs.some((l) => cat.activities.some((a) => a.id === l.type));
              const CatIcon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-[11px] transition-all ${
                    used
                      ? `${cat.bgColor} ${cat.color} ring-1 ring-current/20`
                      : "bg-secondary/50 text-muted-foreground/40"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat.label.split(" ")[0]}
                  {used && <Check className="w-3 h-3" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <WeekBarChart
          title="Minutos de atividade na semana"
          data={weekData.map((d) => ({ day: d.day, value: d.min }))}
          color="bg-baby-mint/60"
          valueScale="minutes"
          formatValue={(v) => `${Math.round(v)} min`}
        />
      </div>

      {/* Today's log */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Registros de hoje</p>
          <div className="space-y-1">
            {logs.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Nenhum registro ainda. Toque em + para adicionar.
              </p>
            )}
            {logs.map((l) => {
              const Icon = activityIconMap[l.type] || Activity;
              const cat = activityCategories.find((c) => c.activities.some((a) => a.id === l.type));
              return (
                <div key={l.id} className="flex items-start gap-3 py-2.5 group">
                  <span className="text-xs text-muted-foreground w-10 shrink-0 pt-1">{l.time}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cat?.bgColor || "bg-baby-mint/40"}`}>
                    <Icon className="w-4 h-4 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm truncate">{l.label}</p>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{l.duration} min</span>
                    </div>
                    {l.notes && <p className="text-xs text-muted-foreground truncate">{l.notes}</p>}
                    {cat && (
                      <span className={`text-[10px] ${cat.color}/70`}>{cat.label}</span>
                    )}
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
      <TrackerDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (formStep === "details" && !editingEntry) {
              setFormStep("select");
            } else {
              setDrawerOpen(false);
            }
          } else {
            setDrawerOpen(open);
          }
        }}
        title={
          formStep === "select"
            ? "Escolher Atividade"
            : editingEntry
              ? "Editar Atividade"
              : "Registrar Atividade"
        }
      >
              {formStep === "select" ? (
                /* --- Activity Selection Step --- */
                <div className="space-y-4">
                  {/* Favorites section */}
                  {favoriteActivities.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Favoritos
                      </p>
                      <div className="space-y-1">
                        {favoriteActivities.map((a) => {
                          const AIcon = a.icon;
                          const cat = activityCategories.find((c) =>
                            c.activities.some((act) => act.id === a.id)
                          );
                          return (
                            <button
                              key={a.id}
                              onClick={() => handleSelectActivity(a.id)}
                              className={`w-full flex items-center gap-3 py-3 px-3.5 rounded-2xl transition-all active:scale-[0.98] ${cat?.bgColor || "bg-secondary"}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shrink-0">
                                <AIcon className="w-4 h-4 text-foreground/60" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-sm">{a.label}</p>
                                {a.description && (
                                  <p className="text-[10px] text-muted-foreground">{a.description}</p>
                                )}
                              </div>
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => toggleFavorite(a.id, e)}
                                onKeyDown={(e) => { if (e.key === 'Enter') toggleFavorite(a.id, e as any); }}
                                className="p-1 cursor-pointer"
                              >
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* All categories */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Todas as atividades
                    </p>
                    <div className="space-y-2">
                      {activityCategories.map((cat) => {
                        const CatIcon = cat.icon;
                        const isExpanded = expandedCategories.has(cat.id);
                        return (
                          <div key={cat.id} className="rounded-2xl overflow-hidden border border-border/30">
                            <button
                              onClick={() => toggleCategory(cat.id)}
                              className={`w-full flex items-center gap-3 py-3 px-3.5 transition-colors ${
                                isExpanded ? cat.bgColor : "bg-card"
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full ${cat.bgColor} flex items-center justify-center shrink-0`}>
                                <CatIcon className={`w-4 h-4 ${cat.color}`} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-sm">{cat.label}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {cat.activities.length} atividades
                                </p>
                              </div>
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>

                            {isExpanded && (
                              <div className="px-2 pb-2 space-y-0.5">
                                {cat.activities.map((a) => {
                                  const AIcon = a.icon;
                                  const isFav = favorites.has(a.id);
                                  return (
                                    <button
                                      key={a.id}
                                      onClick={() => handleSelectActivity(a.id)}
                                      className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary/50 transition-colors active:scale-[0.98]"
                                    >
                                      <div className={`w-7 h-7 rounded-full ${cat.bgColor} flex items-center justify-center shrink-0`}>
                                        <AIcon className="w-3.5 h-3.5 text-foreground/60" />
                                      </div>
                                      <div className="flex-1 text-left">
                                        <p className="text-xs">{a.label}</p>
                                        {a.description && (
                                          <p className="text-[10px] text-muted-foreground">
                                            {a.description}
                                          </p>
                                        )}
                                      </div>
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => toggleFavorite(a.id, e)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') toggleFavorite(a.id, e as any); }}
                                        className="p-1 cursor-pointer"
                                      >
                                        <Star
                                          className={`w-3.5 h-3.5 ${
                                            isFav
                                              ? "text-amber-400 fill-amber-400"
                                              : "text-muted-foreground/30"
                                          }`}
                                        />
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* --- Details Step --- */
                <div>
                  {/* Selected activity preview */}
                  {(() => {
                    const sel = allActivities.find((a) => a.id === formType);
                    const cat = activityCategories.find((c) =>
                      c.activities.some((a) => a.id === formType)
                    );
                    const SelIcon = sel?.icon || Activity;
                    return (
                      <div className={`flex items-center gap-3 p-3.5 rounded-2xl mb-5 ${cat?.bgColor || "bg-secondary"}`}>
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                          <SelIcon className={`w-5 h-5 ${cat?.color || "text-foreground/60"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{sel?.label || "Atividade"}</p>
                          {cat && <p className="text-[10px] text-muted-foreground">{cat.label}</p>}
                        </div>
                        {!editingEntry && (
                          <button
                            onClick={() => setFormStep("select")}
                            className="text-xs text-baby-mint underline"
                          >
                            Trocar
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <EventDateField value={formDateYmd} onChange={setFormDateYmd} />

                  {/* Horário */}
                  <div className="mb-5">
                    <label className="text-xs text-muted-foreground mb-2 block">Horário</label>
                    <TimePickerField value={formTime} onChange={setFormTime} />
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
              )}
      </TrackerDrawer>
    </div>
  );
}