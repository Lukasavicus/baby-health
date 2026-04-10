import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Pill,
  Check,
  Pencil,
  Trash2,
  Calendar,
  ChevronRight,
  Clock,
  Pause,
  Play,
  Heart,
  ShieldPlus,
} from "lucide-react";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";
import { TrackerDrawer } from "../TrackerDrawer";

function formatHistoryDate(ymd: string): string {
  const d = new Date(ymd + "T12:00:00");
  if (d.getFullYear() !== new Date().getFullYear()) {
    const dd = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  }
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface VitaminEntry {
  id: string;
  category?: "vitamin" | "medication";
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

type HistoryRowVM = {
  date: string;
  dose: string;
  notes: string;
  name: string;
  type: string;
  itemDose: string;
  parentId: string;
  historyIndex: number;
};

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
  const [formCategory, setFormCategory] = useState<"vitamin" | "medication">("vitamin");
  const [formName, setFormName] = useState("");
  const [formDose, setFormDose] = useState("");
  const [formUnit, setFormUnit] = useState("gotas");
  const [formFrequency, setFormFrequency] = useState("1x ao dia");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [historyEntryDrawerOpen, setHistoryEntryDrawerOpen] = useState(false);
  const [editingHistoryRow, setEditingHistoryRow] = useState<{
    parentId: string;
    historyIndex: number;
    name: string;
  } | null>(null);
  const [histFormDate, setHistFormDate] = useState("");
  const [histFormDose, setHistFormDose] = useState("");
  const [histFormNotes, setHistFormNotes] = useState("");

  const activeVitamins = vitamins.filter((v) => v.active && (v.category || "vitamin") === "vitamin");
  const activeMedications = vitamins.filter((v) => v.active && v.category === "medication");
  const inactiveItems = vitamins.filter((v) => !v.active);

  const openNew = (cat: "vitamin" | "medication" = "vitamin") => {
    setEditingVitamin(null);
    setDetailVitamin(null);
    setFormCategory(cat);
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
    setFormCategory(v.category || "vitamin");
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
      category: formCategory,
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

  const persistVitamins = (next: VitaminEntry[]) => {
    setVitamins(next);
    setDetailVitamin((d) => {
      if (!d) return d;
      const u = next.find((x) => x.id === d.id);
      return u ?? d;
    });
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { vitamins: next }).catch((e) => console.error(e));
    }
  };

  const openHistoryEntryEdit = (row: HistoryRowVM) => {
    setEditingHistoryRow({
      parentId: row.parentId,
      historyIndex: row.historyIndex,
      name: row.name,
    });
    setHistFormDate(row.date);
    setHistFormDose(row.dose);
    setHistFormNotes(row.notes || "");
    setHistoryEntryDrawerOpen(true);
  };

  const handleSaveHistoryEntry = () => {
    if (!editingHistoryRow || !histFormDate.trim() || !histFormDose.trim()) return;
    const { parentId, historyIndex } = editingHistoryRow;
    const next = vitamins.map((v) => {
      if (v.id !== parentId) return v;
      const nh = [...v.history];
      if (historyIndex < 0 || historyIndex >= nh.length) return v;
      nh[historyIndex] = {
        date: histFormDate.trim(),
        dose: histFormDose.trim(),
        notes: histFormNotes.trim(),
      };
      return { ...v, history: nh };
    });
    persistVitamins(next);
    setHistoryEntryDrawerOpen(false);
    setEditingHistoryRow(null);
  };

  const handleDeleteHistoryEntry = (parentId: string, historyIndex: number) => {
    if (!window.confirm("Excluir este registro do histórico?")) return;
    const next = vitamins.map((v) => {
      if (v.id !== parentId) return v;
      return { ...v, history: v.history.filter((_, i) => i !== historyIndex) };
    });
    persistVitamins(next);
    if (
      editingHistoryRow?.parentId === parentId &&
      editingHistoryRow.historyIndex === historyIndex
    ) {
      setHistoryEntryDrawerOpen(false);
      setEditingHistoryRow(null);
    }
  };

  const units = ["gotas", "mL", "UI", "mg", "mg/kg", "mcg"];
  const frequencies = ["1x ao dia", "2x ao dia", "3x ao dia", "Dias alternados", "Semanal", "Uso livre"];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/my-baby/health")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Vitaminas & Medicamentos</h2>
        </div>
        <button
          onClick={() => openNew("vitamin")}
          className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Active vitamins */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-baby-pink/20 flex items-center justify-center">
              <ShieldPlus className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <p className="text-sm">Vitaminas</p>
              <p className="text-[10px] text-muted-foreground">Suplementação nutricional e fortalecimento</p>
            </div>
          </div>
          <div className="space-y-2">
            {activeVitamins.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">Nenhuma vitamina cadastrada.</p>
            )}
            {activeVitamins.map((v) => (
              <button
                key={v.id}
                onClick={() => openDetail(v)}
                className="w-full bg-baby-pink/10 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm">{v.name}</p>
                    <span className="text-[10px] bg-baby-pink/20 text-foreground/70 px-2 py-0.5 rounded-full">{v.frequency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Pill className="w-3 h-3 inline mr-1" />{v.dose} {v.unit}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active medications */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-baby-pink/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <p className="text-sm">Medicamentos</p>
              <p className="text-[10px] text-muted-foreground">Para quando o bebê está doente ou com desconforto</p>
            </div>
          </div>
          <div className="space-y-2">
            {activeMedications.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">Nenhum medicamento cadastrado.</p>
            )}
            {activeMedications.map((v) => (
              <button
                key={v.id}
                onClick={() => openDetail(v)}
                className="w-full bg-baby-pink/10 rounded-2xl p-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm">{v.name}</p>
                    <span className="text-[10px] bg-baby-pink/20 text-foreground/70 px-2 py-0.5 rounded-full">{v.frequency}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Pill className="w-3 h-3 inline mr-1" />{v.dose} {v.unit}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inactive items */}
      {inactiveItems.length > 0 && (
        <div className="px-4 mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Pause className="w-3 h-3 text-muted-foreground" />
            Encerrados ({inactiveItems.length})
          </p>
          <div className="space-y-2">
            {inactiveItems.map((v) => (
              <button
                key={v.id}
                onClick={() => openDetail(v)}
                className="w-full bg-card rounded-2xl p-3 shadow-sm border border-border/50 flex items-center gap-3 active:scale-[0.98] transition-transform opacity-70"
              >
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm">{v.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {v.dose} {v.unit} · {v.frequency}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail / Form Drawer */}
      <TrackerDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) {
            setDetailVitamin(null);
            setEditingVitamin(null);
          }
        }}
        title={
          detailVitamin
            ? detailVitamin.name
            : `${editingVitamin ? "Editar" : formCategory === "medication" ? "Novo Medicamento" : "Novo Suplemento"}`
        }
      >
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
                        <div key={`${detailVitamin.id}-h-${i}-${h.date}`} className="flex items-start gap-2">
                          <span className="text-[10px] text-muted-foreground w-16 shrink-0 pt-0.5">
                            {formatHistoryDate(h.date)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs">{h.dose}</p>
                            {h.notes && <p className="text-[10px] text-muted-foreground">{h.notes}</p>}
                          </div>
                          {canPersist && babyId ? (
                            <div className="flex shrink-0 gap-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openHistoryEntryEdit({
                                    ...h,
                                    parentId: detailVitamin.id,
                                    historyIndex: i,
                                    name: detailVitamin.name,
                                    type: detailVitamin.category || "vitamin",
                                    itemDose: `${detailVitamin.dose} ${detailVitamin.unit}`,
                                  })
                                }
                                className="p-1.5 rounded-full text-muted-foreground hover:bg-background"
                                aria-label="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHistoryEntry(detailVitamin.id, i)}
                                className="p-1.5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : null}
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
                    <label className="text-xs text-muted-foreground mb-2 block">Tipo</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormCategory("vitamin")}
                        className={`flex-1 py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 ${
                          formCategory === "vitamin"
                            ? "bg-baby-mint text-white shadow-sm"
                            : "bg-secondary text-foreground/60"
                        }`}
                      >
                        <ShieldPlus className="w-3.5 h-3.5" />
                        Vitamina
                      </button>
                      <button
                        onClick={() => setFormCategory("medication")}
                        className={`flex-1 py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 ${
                          formCategory === "medication"
                            ? "bg-baby-pink text-white shadow-sm"
                            : "bg-secondary text-foreground/60"
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        Medicamento
                      </button>
                    </div>
                  </div>

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
      </TrackerDrawer>

      <TrackerDrawer
        open={historyEntryDrawerOpen}
        onOpenChange={(o) => {
          setHistoryEntryDrawerOpen(o);
          if (!o) setEditingHistoryRow(null);
        }}
        title={editingHistoryRow?.name ?? "Histórico"}
      >
              <p className="text-xs text-muted-foreground mb-4">
                Ajuste data, dose anotada e observações deste registro.
              </p>
              <label className="text-xs text-muted-foreground mb-1.5 block">Data</label>
              <input
                type="date"
                value={histFormDate}
                onChange={(e) => setHistFormDate(e.target.value)}
                className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none mb-4"
              />
              <label className="text-xs text-muted-foreground mb-1.5 block">Dose / registro</label>
              <input
                value={histFormDose}
                onChange={(e) => setHistFormDose(e.target.value)}
                placeholder="Ex: 400 UI"
                className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none mb-4 placeholder:text-muted-foreground/50"
              />
              <label className="text-xs text-muted-foreground mb-1.5 block">Observações</label>
              <textarea
                value={histFormNotes}
                onChange={(e) => setHistFormNotes(e.target.value)}
                rows={2}
                className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none mb-4"
              />
              {editingHistoryRow ? (
                <button
                  type="button"
                  onClick={() =>
                    handleDeleteHistoryEntry(editingHistoryRow.parentId, editingHistoryRow.historyIndex)
                  }
                  className="w-full py-3 rounded-2xl border border-destructive/30 text-destructive text-sm mb-3 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir este registro
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSaveHistoryEntry}
                disabled={!histFormDate.trim() || !histFormDose.trim()}
                className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Salvar
              </button>
      </TrackerDrawer>
    </div>
  );
}
