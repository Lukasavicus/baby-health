import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import {
  ArrowLeft, Pill, ShieldPlus, Heart, Clock, Plus, Pencil, Trash2, X, Check,
} from "lucide-react";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";

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

export function HealthDetailPage() {
  const navigate = useNavigate();
  const { data, babyId, canPersist } = useUIBootstrap();
  const [items, setItems] = useState<VitaminEntry[]>([]);
  const [detailItem, setDetailItem] = useState<VitaminEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [editingItem, setEditingItem] = useState<VitaminEntry | null>(null);
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

  const units = ["gotas", "mL", "UI", "mg", "mg/kg", "mcg"];
  const frequencies = ["1x ao dia", "2x ao dia", "3x ao dia", "Dias alternados", "Semanal", "Uso livre"];

  const loadItems = useCallback(async () => {
    if (!canPersist || !babyId) {
      const hd = data?.health_detail ?? {};
      const vits = (hd.vitamins ?? []) as VitaminEntry[];
      const meds = (hd.medications ?? []) as VitaminEntry[];
      setItems([...vits, ...meds]);
      return;
    }
    try {
      const s = await getBabyUiState(babyId);
      const stored = s.vitamins as VitaminEntry[] | undefined;
      if (stored?.length) setItems(stored);
      else setItems([]);
    } catch {
      setItems([]);
    }
  }, [data, babyId, canPersist]);

  useEffect(() => {
    if (!data) return;
    void loadItems();
  }, [data, loadItems]);

  const activeVitamins = items.filter((v) => v.active && (v.category || "vitamin") === "vitamin");
  const activeMedications = items.filter((v) => v.active && v.category === "medication");

  const openNew = (cat: "vitamin" | "medication") => {
    setEditingItem(null);
    setDetailItem(null);
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
    setEditingItem(v);
    setDetailItem(null);
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
    setDetailItem(v);
    setEditingItem(null);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const entry: VitaminEntry = {
      id: editingItem?.id || Date.now().toString(),
      category: formCategory,
      name: formName,
      dose: formDose,
      unit: formUnit,
      frequency: formFrequency,
      startDate: formStart,
      endDate: formEnd || null,
      active: !formEnd,
      notes: formNotes,
      history: editingItem?.history || [{ date: formStart, dose: `${formDose} ${formUnit}`, notes: "Inicio" }],
    };
    let next: VitaminEntry[];
    if (editingItem) {
      next = items.map((v) => (v.id === entry.id ? entry : v));
    } else {
      next = [...items, entry];
    }
    setItems(next);
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { vitamins: next }).catch(console.error);
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = items.filter((v) => v.id !== id);
    setItems(next);
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { vitamins: next }).catch(console.error);
    }
    setDeleteConfirm(null);
    setDrawerOpen(false);
  };

  const persistItems = (next: VitaminEntry[]) => {
    setItems(next);
    setDetailItem((d) => {
      if (!d) return d;
      const u = next.find((x) => x.id === d.id);
      return u ?? d;
    });
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { vitamins: next }).catch(console.error);
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
    const next = items.map((v) => {
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
    persistItems(next);
    setHistoryEntryDrawerOpen(false);
    setEditingHistoryRow(null);
  };

  const handleDeleteHistoryEntry = (parentId: string, historyIndex: number) => {
    if (!window.confirm("Excluir este registro do histórico?")) return;
    const next = items.map((v) => {
      if (v.id !== parentId) return v;
      return { ...v, history: v.history.filter((_, i) => i !== historyIndex) };
    });
    persistItems(next);
    if (
      editingHistoryRow?.parentId === parentId &&
      editingHistoryRow.historyIndex === historyIndex
    ) {
      setHistoryEntryDrawerOpen(false);
      setEditingHistoryRow(null);
    }
  };

  const allHistory: HistoryRowVM[] = items
    .flatMap((v) =>
      v.history.map((h, historyIndex) => ({
        ...h,
        parentId: v.id,
        historyIndex,
        name: v.name,
        type: v.category || "vitamin",
        itemDose: `${v.dose} ${v.unit}`,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const groupedHistory: { label: string; entries: HistoryRowVM[] }[] = [];
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  for (const h of allHistory) {
    let label = h.date;
    if (h.date === today) label = "Hoje";
    else if (h.date === yesterday) label = "Ontem";
    else {
      label = formatHistoryDate(h.date);
    }
    const existing = groupedHistory.find((g) => g.label === label);
    if (existing) existing.entries.push(h);
    else groupedHistory.push({ label, entries: [h] });
  }

  return (
    <div className="pb-6">
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1">
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

      {/* Vitamins Section */}
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
                    <span className="text-[10px] bg-baby-pink/20 text-foreground/70 px-2 py-0.5 rounded-full">
                      {v.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Pill className="w-3 h-3" /> {v.dose} {v.unit}
                    </span>
                  </div>
                  {v.notes && <p className="text-[10px] text-muted-foreground mt-1">{v.notes}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medications Section */}
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
                    <span className="text-[10px] bg-baby-pink/20 text-foreground/70 px-2 py-0.5 rounded-full">
                      {v.frequency}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Pill className="w-3 h-3" /> {v.dose} {v.unit}
                    </span>
                  </div>
                  {v.notes && <p className="text-[10px] text-muted-foreground mt-1">{v.notes}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      {groupedHistory.length > 0 && (
        <div className="px-4">
          <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Histórico</p>
            <div className="space-y-4">
              {groupedHistory.map((group) => (
                <div key={group.label}>
                  <p className="text-xs text-muted-foreground mb-2">{group.label}</p>
                  <div className="space-y-2">
                    {group.entries.map((item) => (
                      <div
                        key={`${item.parentId}-${item.historyIndex}-${item.date}`}
                        className="flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-baby-pink/20">
                          <Pill className="w-3 h-3 text-pink-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.dose || item.itemDose}</p>
                          {item.notes ? (
                            <p className="text-[10px] text-muted-foreground/80 truncate">{item.notes}</p>
                          ) : null}
                        </div>
                        {canPersist && babyId ? (
                          <div className="flex items-center shrink-0 gap-0.5">
                            <button
                              type="button"
                              onClick={() => openHistoryEntryEdit(item)}
                              className="p-2 rounded-full text-muted-foreground hover:bg-secondary active:scale-95"
                              aria-label="Editar registro"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHistoryEntry(item.parentId, item.historyIndex)}
                              className="p-2 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95"
                              aria-label="Excluir registro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail / Form Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={(o) => { setDrawerOpen(o); if (!o) { setDetailItem(null); setEditingItem(null); } }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[92vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">
              {detailItem ? detailItem.name : `${editingItem ? "Editar" : formCategory === "medication" ? "Novo Medicamento" : "Novo Suplemento"}`}
            </Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8 overflow-y-auto max-h-[87vh]">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>
                  {detailItem ? detailItem.name : `${editingItem ? "Editar" : formCategory === "medication" ? "Novo Medicamento" : "Novo Suplemento"}`}
                </h3>
                <div className="w-5" />
              </div>

              {detailItem ? (
                <div className="space-y-4">
                  <div className="bg-secondary/30 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{detailItem.dose} {detailItem.unit}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        (detailItem.category || "vitamin") === "vitamin"
                          ? "bg-baby-mint/20 text-primary"
                          : "bg-baby-pink/20 text-baby-pink"
                      }`}>
                        {(detailItem.category || "vitamin") === "vitamin" ? "Vitamina" : "Medicamento"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{detailItem.frequency}</p>
                    <p className="text-xs text-muted-foreground">
                      Inicio: {new Date(detailItem.startDate + "T12:00:00").toLocaleDateString("pt-BR")}
                      {detailItem.endDate && (
                        <> · Fim: {new Date(detailItem.endDate + "T12:00:00").toLocaleDateString("pt-BR")}</>
                      )}
                    </p>
                  </div>

                  {detailItem.notes && (
                    <div className="bg-secondary/30 rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">{detailItem.notes}</p>
                    </div>
                  )}

                  {detailItem.history?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Histórico de alterações
                      </p>
                      <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
                        {detailItem.history.map((h, i) => (
                          <div key={`${detailItem.id}-h-${i}-${h.date}`} className="flex items-start gap-2">
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
                                      parentId: detailItem.id,
                                      historyIndex: i,
                                      name: detailItem.name,
                                      type: detailItem.category || "vitamin",
                                      itemDose: `${detailItem.dose} ${detailItem.unit}`,
                                    })
                                  }
                                  className="p-1.5 rounded-full text-muted-foreground hover:bg-background"
                                  aria-label="Editar"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteHistoryEntry(detailItem.id, i)}
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
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(detailItem)}
                      className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    {deleteConfirm === detailItem.id ? (
                      <button
                        onClick={() => handleDelete(detailItem.id)}
                        className="flex-1 py-3 rounded-2xl bg-destructive/20 text-destructive text-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(detailItem.id)}
                        className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              ) : (
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
                    <label className="text-xs text-muted-foreground mb-2 block">Frequência</label>
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
                      <label className="text-xs text-muted-foreground mb-2 block">Data início</label>
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
                    <label className="text-xs text-muted-foreground mb-2 block">Observações</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Ex: Orientação do pediatra..."
                      rows={2}
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Check className="w-4 h-4" />
                    {editingItem ? "Salvar" : "Registrar"}
                  </button>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <Drawer.Root
        open={historyEntryDrawerOpen}
        onOpenChange={(o) => {
          setHistoryEntryDrawerOpen(o);
          if (!o) setEditingHistoryRow(null);
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-[60] bg-card rounded-t-3xl max-h-[85vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">Editar registro do histórico</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <button type="button" onClick={() => setHistoryEntryDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-sm font-medium truncate max-w-[200px]">
                  {editingHistoryRow?.name ?? "Histórico"}
                </h3>
                <div className="w-5" />
              </div>
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
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
