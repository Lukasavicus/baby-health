import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check, Droplet } from "lucide-react";
import { DiaperIcon } from "../DiaperIcon";
import { EventDateField, clampYmdNotAfterToday, todayYmd } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { createEvent, deleteEvent, listEvents, updateEvent, type ApiEvent } from "@/api/client";
import {
  apiEventToDiaperEntry,
  diaperEntryToIncoming,
  formatYmd,
  isApiEventId,
  weekDayLabelsPt,
  weekDiaperWetDirtyByDay,
} from "@/api/eventMappers";

// --- Types ---
type DiaperType = "pee" | "poo" | "mixed";
type VolumeLevel = 1 | 2 | 3 | 4;

interface DiaperEntry {
  id: string;
  time: string;
  type: DiaperType;
  typeLabel: string;
  peeVolume: VolumeLevel;
  pooVolume: VolumeLevel;
  notes: string;
}

export function DiaperDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, caregiverId, canPersist } = useUIBootstrap();

  const diaperTypes = useMemo(
    () => (data?.catalogs?.diaperTypes ?? []) as { id: DiaperType; label: string }[],
    [data?.catalogs?.diaperTypes],
  );
  const vlRaw = (data?.catalogs?.volumeLabels ?? {}) as Record<string, string>;
  const volumeLabels: Record<VolumeLevel, string> = {
    1: vlRaw["1"] ?? "Pouco",
    2: vlRaw["2"] ?? "Normal",
    3: vlRaw["3"] ?? "Bastante",
    4: vlRaw["4"] ?? "Muito",
  };
  const volumeColors = (data?.catalogs?.volumeColors ?? {}) as Record<string, string>;
  const pooVolumeColors = (data?.catalogs?.pooVolumeColors ?? {}) as Record<string, string>;
  const seedWeekData = useMemo(
    () =>
      (data?.tracker_logs?.diaper?.weekData ?? []) as {
        day: string;
        wet: number;
        dirty: number;
      }[],
    [data?.tracker_logs?.diaper?.weekData],
  );
  const weekLabels = useMemo(() => weekDayLabelsPt(), []);

  const [diaperApiEvents, setDiaperApiEvents] = useState<ApiEvent[]>([]);
  const [logs, setLogs] = useState<DiaperEntry[]>([]);

  const refreshFromApi = useCallback(async () => {
    if (!canPersist || !babyId || !caregiverId) return;
    const evs = await listEvents({ baby_id: babyId, event_type: "diaper" });
    setDiaperApiEvents(evs);
    const todayYmd = formatYmd(new Date());
    const mapped = evs
      .filter((e) => formatYmd(new Date(e.timestamp)) === todayYmd)
      .map((e) => {
        const d = apiEventToDiaperEntry(e);
        const typeLabel =
          diaperTypes.find((t) => t.id === (d.type as DiaperType))?.label || d.type;
        return {
          id: d.id,
          time: d.time,
          type: d.type as DiaperType,
          typeLabel,
          peeVolume: d.peeVolume as VolumeLevel,
          pooVolume: d.pooVolume as VolumeLevel,
          notes: d.notes,
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
    setLogs(mapped);
  }, [babyId, caregiverId, canPersist, diaperTypes]);

  useEffect(() => {
    if (!data) return;
    if (canPersist && babyId && caregiverId) {
      void refreshFromApi().catch(() => {
        const L = data.tracker_logs?.diaper?.initialLogs as DiaperEntry[] | undefined;
        if (L?.length) setLogs(L);
      });
      return;
    }
    const L = data.tracker_logs?.diaper?.initialLogs as DiaperEntry[] | undefined;
    if (L?.length) setLogs(L);
    else setLogs([]);
  }, [data, canPersist, babyId, caregiverId, refreshFromApi]);

  const weekData = useMemo(() => {
    if (canPersist && diaperApiEvents.length > 0) {
      return weekDiaperWetDirtyByDay(diaperApiEvents, weekLabels, new Date());
    }
    return seedWeekData;
  }, [canPersist, diaperApiEvents, weekLabels, seedWeekData]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaperEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formType, setFormType] = useState<DiaperType>("pee");
  const [formTime, setFormTime] = useState("");
  const [formPeeVol, setFormPeeVol] = useState<VolumeLevel>(2);
  const [formPooVol, setFormPooVol] = useState<VolumeLevel>(2);
  const [formNotes, setFormNotes] = useState("");
  const [formDateYmd, setFormDateYmd] = useState(() => todayYmd());

  // Computed
  const peeCount = logs.filter((l) => l.type === "pee" || l.type === "mixed").length;
  const pooCount = logs.filter((l) => l.type === "poo" || l.type === "mixed").length;
  const totalCount = logs.length;
  const maxD = weekData.length ? Math.max(...weekData.map((d) => d.wet + d.dirty), 1) : 1;

  const nowTime = () => {
    const n = new Date();
    return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
  };

  const openNew = () => {
    setEditingEntry(null);
    setFormType("pee");
    setFormTime(nowTime());
    setFormPeeVol(2);
    setFormPooVol(2);
    setFormNotes("");
    setFormDateYmd(todayYmd());
    setDrawerOpen(true);
  };

  const openEdit = (entry: DiaperEntry) => {
    setEditingEntry(entry);
    let dateYmd = todayYmd();
    if (isApiEventId(entry.id)) {
      const ev = diaperApiEvents.find((e) => e.id === entry.id);
      if (ev) dateYmd = formatYmd(new Date(ev.timestamp));
    }
    setFormDateYmd(dateYmd);
    setFormType(entry.type);
    setFormTime(entry.time);
    setFormPeeVol(entry.peeVolume);
    setFormPooVol(entry.pooVolume);
    setFormNotes(entry.notes);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const typeLabel = diaperTypes.find((t) => t.id === formType)?.label || "Xixi";
    const dayYmd = clampYmdNotAfterToday(formDateYmd);

    void (async () => {
      try {
        if (canPersist && babyId && caregiverId) {
          const incoming = diaperEntryToIncoming(
            {
              type: formType,
              time: formTime,
              peeVolume: formPeeVol,
              pooVolume: formPooVol,
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

        const entry: DiaperEntry = {
          id: editingEntry?.id || Date.now().toString(),
          time: formTime,
          type: formType,
          typeLabel,
          peeVolume: formPeeVol,
          pooVolume: formPooVol,
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

  const showPeeVol = formType === "pee" || formType === "mixed";
  const showPooVol = formType === "poo" || formType === "mixed";

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Fraldas</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-amber-300 text-amber-900 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-baby-blue/20 rounded-2xl p-4">
              <p className="text-2xl">{peeCount}</p>
              <p className="text-[10px] text-muted-foreground">xixi</p>
            </div>
            <div className="bg-amber-100 rounded-2xl p-4">
              <p className="text-2xl">{pooCount}</p>
              <p className="text-[10px] text-muted-foreground">cocô</p>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-4">
              <p className="text-2xl">{totalCount}</p>
              <p className="text-[10px] text-muted-foreground">total</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Normal para 8 meses: 4–6 fraldas/dia
          </p>
        </div>
      </div>

      {/* Week chart */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-1">Fraldas na semana</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-baby-blue" />
              <span className="text-[10px] text-muted-foreground">Xixi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <span className="text-[10px] text-muted-foreground">Cocô</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: `${((d.wet + d.dirty) / maxD) * 100}%`, minHeight: 8 }}>
                  <div className="flex-1 rounded-t-lg bg-baby-blue/60" style={{ flex: d.wet }} />
                  {d.dirty > 0 && <div className="rounded-b-lg bg-amber-300/80" style={{ flex: d.dirty }} />}
                </div>
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
                <span className="text-xs text-muted-foreground w-10 pt-0.5 shrink-0">{l.time}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm">{l.typeLabel}</p>
                    {(l.type === "pee" || l.type === "mixed") && (
                      <span className={`text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1.5 ${volumeColors[String(l.peeVolume)]}`}>
                        <Droplet className="w-2.5 h-2.5" />
                        <VolumeDots level={l.peeVolume} active />
                      </span>
                    )}
                    {(l.type === "poo" || l.type === "mixed") && (
                      <span className={`text-[10px] px-2 py-1 rounded-full inline-flex items-center gap-1.5 ${pooVolumeColors[String(l.pooVolume)]}`}>
                        <PooIcon className="w-2.5 h-2.5" />
                        <VolumeDots level={l.pooVolume} active />
                      </span>
                    )}
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
            <Drawer.Title className="sr-only">{editingEntry ? "Editar" : "Novo"} Registro de Fralda</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>{editingEntry ? "Editar" : "Nova"} Fralda</h3>
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
                <div className="flex gap-2">
                  {diaperTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setFormType(t.id)}
                      className={`flex-1 py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 ${
                        formType === t.id
                          ? "bg-amber-300 text-amber-900 shadow-sm"
                          : "bg-secondary text-foreground/60"
                      }`}
                    >
                      {(t.id === "pee" || t.id === "mixed") && <Droplet className="w-3.5 h-3.5" />}
                      {(t.id === "poo" || t.id === "mixed") && <PooIcon className="w-3.5 h-3.5" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Xixi */}
              {showPeeVol && (
                <div className="mb-5">
                  <label className="text-xs text-muted-foreground mb-2 block">Volume do Xixi</label>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4] as VolumeLevel[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setFormPeeVol(v)}
                        className={`flex-1 py-3 rounded-2xl text-xs transition-all flex flex-col items-center gap-1 ${
                          formPeeVol === v ? volumeColors[String(v)] + " shadow-sm" : "bg-secondary text-foreground/60"
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {Array.from({ length: v }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${formPeeVol === v ? "bg-current" : "bg-baby-blue/60"}`} />
                          ))}
                        </div>
                        <span>{volumeLabels[v]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Volume Cocô */}
              {showPooVol && (
                <div className="mb-5">
                  <label className="text-xs text-muted-foreground mb-2 block">Volume do Cocô</label>
                  <div className="flex gap-2">
                    {([1, 2, 3, 4] as VolumeLevel[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => setFormPooVol(v)}
                        className={`flex-1 py-3 rounded-2xl text-xs transition-all flex flex-col items-center gap-1 ${
                          formPooVol === v ? pooVolumeColors[String(v)] + " shadow-sm" : "bg-secondary text-foreground/60"
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {Array.from({ length: v }).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${formPooVol === v ? "bg-current" : "bg-amber-400/60"}`} />
                          ))}
                        </div>
                        <span>{volumeLabels[v]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">Observações</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: Consistência firme, assadura leve..."
                  rows={3}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-amber-300 text-amber-900 text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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

// Simple poo icon component
function PooIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4.5 13.5c-1.5 0-2.5-1-2.5-2.2 0-1 .7-1.8 1.6-2.1-.3-.4-.6-1-.6-1.7 0-1.2 1-2.2 2.2-2.2h.3c-.1-.3-.2-.6-.2-1 0-1.5 1.3-2.8 3-2.8 1 0 1.8.4 2.3 1.1.4-.2.8-.3 1.2-.3 1.3 0 2.4 1 2.4 2.3 0 .4-.1.8-.3 1.1.9.4 1.6 1.3 1.6 2.4 0 1.4-1.1 2.5-2.5 2.5h-.2c.2.4.2.8.2 1.2 0 1.2-1 2.2-2.5 2.2H4.5z" />
    </svg>
  );
}

// Volume dots component
function VolumeDots({ level, active }: { level: number; active: boolean }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < level
              ? active ? "bg-current" : "bg-current/60"
              : active ? "bg-current/20" : "bg-current/15"
          }`}
        />
      ))}
    </div>
  );
}