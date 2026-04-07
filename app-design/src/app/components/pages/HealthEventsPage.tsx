import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  Plus,
  Activity,
  X,
  Check,
  Pencil,
  Trash2,
  Camera,
  Calendar,
} from "lucide-react";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";

type EventType = "fever" | "cold" | "allergy" | "malaise" | "consultation" | "other";

interface HealthEvent {
  id: string;
  type: EventType;
  date: string;
  endDate: string | null;
  description: string;
  notes: string;
}

export function HealthEventsPage() {
  const navigate = useNavigate();
  const { data, babyId, canPersist } = useUIBootstrap();

  const eventTypes = useMemo(() => {
    const raw = (data?.catalogs?.healthEventTypes ?? []) as {
      id: EventType;
      label: string;
      icon: string;
      color: string;
      bgColor: string;
    }[];
    return raw.map((t) => ({ ...t, icon: getIcon(t.icon) }));
  }, [data?.catalogs?.healthEventTypes]);

  const eventTypeMap = useMemo(
    () => Object.fromEntries(eventTypes.map((t) => [t.id, t])),
    [eventTypes],
  );

  const [events, setEvents] = useState<HealthEvent[]>([]);

  useEffect(() => {
    if (!data) return;
    if (!canPersist || !babyId) {
      const ev = data.health_events?.events as HealthEvent[] | undefined;
      if (ev?.length) setEvents(ev);
      return;
    }
    void getBabyUiState(babyId)
      .then((s) => {
        const stored = s.health_events as HealthEvent[] | undefined;
        if (stored?.length) setEvents(stored);
        else {
          const ev = data.health_events?.events as HealthEvent[] | undefined;
          if (ev?.length) setEvents(ev);
          else setEvents([]);
        }
      })
      .catch(() => {
        const ev = data.health_events?.events as HealthEvent[] | undefined;
        if (ev?.length) setEvents(ev);
      });
  }, [data, babyId, canPersist]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HealthEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form
  const [formType, setFormType] = useState<EventType>("consultation");
  const [formDate, setFormDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const openNew = () => {
    setEditingEvent(null);
    setFormType("consultation");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setFormDescription("");
    setFormNotes("");
    setDrawerOpen(true);
  };

  const openEdit = (e: HealthEvent) => {
    setEditingEvent(e);
    setFormType(e.type);
    setFormDate(e.date);
    setFormEndDate(e.endDate || "");
    setFormDescription(e.description);
    setFormNotes(e.notes);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const entry: HealthEvent = {
      id: editingEvent?.id || Date.now().toString(),
      type: formType,
      date: formDate,
      endDate: formEndDate || null,
      description: formDescription,
      notes: formNotes,
    };
    if (editingEvent) {
      const next = events.map((e) => (e.id === entry.id ? entry : e));
      setEvents(next);
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { health_events: next }).catch((e) => console.error(e));
      }
    } else {
      const next = [entry, ...events].sort((a, b) => b.date.localeCompare(a.date));
      setEvents(next);
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { health_events: next }).catch((e) => console.error(e));
      }
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { health_events: next }).catch((e) => console.error(e));
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/my-baby/health")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Eventos de Saude</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            Historico de saude — util para consultas com o pediatra
          </p>
          <div className="flex gap-3 flex-wrap">
            {eventTypes.map((t) => {
              const count = events.filter((e) => e.type === t.id).length;
              if (count === 0) return null;
              const Icon = t.icon;
              return (
                <div key={t.id} className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] ${t.bgColor} ${t.color}`}>
                  <Icon className="w-3 h-3" />
                  {count} {t.label.toLowerCase()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="px-4 space-y-3">
        {events.length === 0 && (
          <div className="bg-card rounded-3xl p-8 shadow-sm border border-border/50 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum evento registrado</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">
              Registre consultas, febres e outros eventos de saude aqui
            </p>
          </div>
        )}
        {events.map((e) => {
          const t = eventTypeMap[e.type];
          const Icon = t?.icon || Activity;
          const d = new Date(e.date + "T12:00:00");
          return (
            <div key={e.id} className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 group">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${t?.bgColor || "bg-secondary"}`}>
                  <Icon className={`w-5 h-5 ${t?.color || "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">{e.description || t?.label}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${t?.bgColor} ${t?.color}`}>
                      {t?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-muted-foreground">
                      {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      {e.endDate && (
                        <> — {new Date(e.endDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</>
                      )}
                    </span>
                  </div>
                  {e.notes && (
                    <p className="text-xs text-muted-foreground mt-2 bg-secondary/30 rounded-xl p-2.5">
                      {e.notes}
                    </p>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(e)}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
                {deleteConfirm === e.id ? (
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-destructive" />
                  </button>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(e.id)}
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

      {/* Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[92vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">
              {editingEvent ? "Editar" : "Novo"} Evento
            </Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[87vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>{editingEvent ? "Editar" : "Novo"} Evento</h3>
                <div className="w-5" />
              </div>

              {/* Type */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {eventTypes.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setFormType(t.id)}
                        className={`py-3 rounded-2xl text-[11px] transition-all flex flex-col items-center gap-1.5 ${
                          formType === t.id
                            ? `${t.bgColor} ${t.color} ring-1 ring-current/20`
                            : "bg-secondary text-foreground/60"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Data inicio</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Data fim (opcional)</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Descricao</label>
                <input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: Resfriado leve, Consulta 7 meses..."
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Observacoes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Sintomas, medicacoes usadas, orientacoes do medico..."
                  rows={3}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Photo placeholder */}
              <button className="w-full border-2 border-dashed border-border rounded-2xl py-4 flex flex-col items-center gap-2 text-muted-foreground/50 mb-4">
                <Camera className="w-5 h-5" />
                <span className="text-xs">Adicionar foto ou documento</span>
              </button>

              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Check className="w-4 h-4" />
                {editingEvent ? "Salvar" : "Registrar"}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
