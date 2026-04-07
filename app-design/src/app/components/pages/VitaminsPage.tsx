import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  Plus,
  Pill,
  X,
  Check,
  Pencil,
  Trash2,
  Calendar,
  ChevronRight,
  Clock,
  Pause,
  Play,
} from "lucide-react";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";

interface VitaminEntry {
  id: string;
  name: string;
  dose: string;
  unit: string;
  frequency: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
  notes: string;
  history: { date: string; dose: string; notes: string }[];
}

export function VitaminsPage() {
  const navigate = useNavigate();
  const { data, babyId, canPersist } = useUIBootstrap();
  const [vitamins, setVitamins] = useState<VitaminEntry[]>([]);

  useEffect(() => {
    if (!data) return;
    if (!canPersist || !babyId) {
      const v = data.vitamins?.vitamins as VitaminEntry[] | undefined;
      if (v?.length) setVitamins(v);
      return;
    }
    void getBabyUiState(babyId)
      .then((s) => {
        const stored = s.vitamins as VitaminEntry[] | undefined;
        if (stored?.length) setVitamins(stored);
        else {
          const v = data.vitamins?.vitamins as VitaminEntry[] | undefined;
          if (v?.length) setVitamins(v);
          else setVitamins([]);
        }
      })
      .catch(() => {
        const v = data.vitamins?.vitamins as VitaminEntry[] | undefined;
        if (v?.length) setVitamins(v);
      });
  }, [data, babyId, canPersist]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailVitamin, setDetailVitamin] = useState<VitaminEntry | null>(null);
  const [editingVitamin, setEditingVitamin] = useState<VitaminEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formDose, setFormDose] = useState("");
  const [formUnit, setFormUnit] = useState("gotas");
  const [formFrequency, setFormFrequency] = useState("1x ao dia");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const activeVitamins = vitamins.filter((v) => v.active);
  const inactiveVitamins = vitamins.filter((v) => !v.active);

  const openNew = () => {
    setEditingVitamin(null);
    setDetailVitamin(null);
    setFormName("");
    setFormDose("");
    setFormUnit("gotas");
    setFormFrequency("1x ao dia");
    setFormStart(new Date().toISOString().split("T")[0]);
    setFormEnd("");
    setFormNotes("");
    setDrawerOpen(true);
  };

  const openEdit = (v: VitaminEntry) => {
    setEditingVitamin(v);
    setDetailVitamin(null);
    setFormName(v.name);
    setFormDose(v.dose);
    setFormUnit(v.unit);
    setFormFrequency(v.frequency);
    setFormStart(v.startDate);
    setFormEnd(v.endDate || "");
    setFormNotes(v.notes);
    setDrawerOpen(true);
  };

  const openDetail = (v: VitaminEntry) => {
    setDetailVitamin(v);
    setEditingVitamin(null);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const entry: VitaminEntry = {
      id: editingVitamin?.id || Date.now().toString(),
      name: formName,
      dose: formDose,
      unit: formUnit,
      frequency: formFrequency,
      startDate: formStart,
      endDate: formEnd || null,
      active: !formEnd,
      notes: formNotes,
      history: editingVitamin?.history || [{ date: formStart, dose: `${formDose} ${formUnit}`, notes: "Inicio" }],
    };
    if (editingVitamin) {
      const next = vitamins.map((v) => (v.id === entry.id ? entry : v));
      setVitamins(next);
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { vitamins: next }).catch((e) => console.error(e));
      }
    } else {
      const next = [...vitamins, entry];
      setVitamins(next);
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { vitamins: next }).catch((e) => console.error(e));
      }
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = vitamins.filter((v) => v.id !== id);
    setVitamins(next);
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { vitamins: next }).catch((e) => console.error(e));
    }
    setDeleteConfirm(null);
    setDrawerOpen(false);
  };

  const units = ["gotas", "mL", "UI", "mg", "mg/kg", "mcg"];
  const frequencies = ["1x ao dia", "2x ao dia", "3x ao dia", "Dias alternados", "Semanal"];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/my-baby/health")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Vitaminas & Suplementos</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Active vitamins */}
      <div className="px-4 mb-4">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Play className="w-3 h-3 text-primary" />
          Em uso ({activeVitamins.length})
        </p>
        <div className="space-y-3">
          {activeVitamins.map((v) => (
            <button
              key={v.id}
              onClick={() => openDetail(v)}
              className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-baby-peach/30 flex items-center justify-center shrink-0">
                <Pill className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm">{v.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {v.dose} {v.unit} · {v.frequency}
                </p>
                <p className="text-[10px] text-muted-foreground/50">
                  Desde {new Date(v.startDate + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] bg-baby-mint/20 text-primary px-2 py-0.5 rounded-full">
                  Ativo
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Inactive vitamins */}
      {inactiveVitamins.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Pause className="w-3 h-3 text-muted-foreground" />
            Encerrados ({inactiveVitamins.length})
          </p>
          <div className="space-y-3">
            {inactiveVitamins.map((v) => (
              <button
                key={v.id}
                onClick={() => openDetail(v)}
                className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-3.5 active:scale-[0.98] transition-transform opacity-70"
              >
                <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                  <Pill className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {v.dose} {v.unit} · {v.frequency}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50">
                    {new Date(v.startDate + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} -{" "}
                    {v.endDate ? new Date(v.endDate + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : ""}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail / Form Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={(o) => { setDrawerOpen(o); if (!o) { setDetailVitamin(null); setEditingVitamin(null); } }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[92vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">
              {detailVitamin ? detailVitamin.name : editingVitamin ? "Editar" : "Novo"} Suplemento
            </Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[87vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>
                  {detailVitamin ? detailVitamin.name : editingVitamin ? "Editar" : "Novo"} Suplemento
                </h3>
                <div className="w-5" />
              </div>

              {detailVitamin ? (
                /* --- Detail --- */
                <div className="space-y-4">
                  <div className="bg-secondary/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{detailVitamin.dose} {detailVitamin.unit}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${detailVitamin.active ? "bg-baby-mint/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {detailVitamin.active ? "Ativo" : "Encerrado"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{detailVitamin.frequency}</p>
                    <p className="text-xs text-muted-foreground">
                      Inicio: {new Date(detailVitamin.startDate + "T12:00:00").toLocaleDateString("pt-BR")}
                      {detailVitamin.endDate && (
                        <> · Fim: {new Date(detailVitamin.endDate + "T12:00:00").toLocaleDateString("pt-BR")}</>
                      )}
                    </p>
                  </div>

                  {detailVitamin.notes && (
                    <div className="bg-secondary/30 rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">{detailVitamin.notes}</p>
                    </div>
                  )}

                  {/* Dose history */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Historico de alteracoes
                    </p>
                    <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
                      {detailVitamin.history.map((h, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-[10px] text-muted-foreground w-16 shrink-0 pt-0.5">
                            {new Date(h.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                          </span>
                          <div>
                            <p className="text-xs">{h.dose}</p>
                            {h.notes && <p className="text-[10px] text-muted-foreground">{h.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(detailVitamin)}
                      className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    {deleteConfirm === detailVitamin.id ? (
                      <button
                        onClick={() => handleDelete(detailVitamin.id)}
                        className="flex-1 py-3 rounded-2xl bg-destructive/20 text-destructive text-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(detailVitamin.id)}
                        className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* --- Form --- */
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Nome</label>
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Vitamina D"
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Dose</label>
                      <input
                        value={formDose}
                        onChange={(e) => setFormDose(e.target.value)}
                        placeholder="400"
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Unidade</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {units.map((u) => (
                          <button
                            key={u}
                            onClick={() => setFormUnit(u)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                              formUnit === u ? "bg-primary text-white" : "bg-secondary text-foreground/60"
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Frequencia</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {frequencies.map((f) => (
                        <button
                          key={f}
                          onClick={() => setFormFrequency(f)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] transition-all ${
                            formFrequency === f ? "bg-primary text-white" : "bg-secondary text-foreground/60"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Data inicio</label>
                      <input
                        type="date"
                        value={formStart}
                        onChange={(e) => setFormStart(e.target.value)}
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Data fim (opcional)</label>
                      <input
                        type="date"
                        value={formEnd}
                        onChange={(e) => setFormEnd(e.target.value)}
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Observacoes</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Ex: Orientacao do pediatra..."
                      rows={2}
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Check className="w-4 h-4" />
                    {editingVitamin ? "Salvar" : "Registrar"}
                  </button>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
