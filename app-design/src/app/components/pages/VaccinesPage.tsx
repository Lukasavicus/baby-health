import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Syringe,
  Check,
  Pencil,
  Trash2,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronRight,
  Camera,
} from "lucide-react";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";
import { TrackerDrawer } from "../TrackerDrawer";

interface Vaccine {
  id: string;
  name: string;
  date: string;
  manufacturer: string;
  location: string;
  hadReaction: boolean;
  reactionDetails: string;
  notes: string;
  dose: string; // "1a dose", "2a dose", etc.
}

export function VaccinesPage() {
  const navigate = useNavigate();
  const { data, babyId, canPersist } = useUIBootstrap();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);

  useEffect(() => {
    if (!data) return;
    if (!canPersist || !babyId) {
      const v = data.vaccines?.vaccines as Vaccine[] | undefined;
      if (v?.length) setVaccines(v);
      return;
    }
    void getBabyUiState(babyId)
      .then((s) => {
        const stored = s.vaccines as Vaccine[] | undefined;
        if (stored?.length) setVaccines(stored);
        else {
          const v = data.vaccines?.vaccines as Vaccine[] | undefined;
          if (v?.length) setVaccines(v);
          else setVaccines([]);
        }
      })
      .catch(() => {
        const v = data.vaccines?.vaccines as Vaccine[] | undefined;
        if (v?.length) setVaccines(v);
      });
  }, [data, babyId, canPersist]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailVaccine, setDetailVaccine] = useState<Vaccine | null>(null);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formDose, setFormDose] = useState("");
  const [formManufacturer, setFormManufacturer] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formReaction, setFormReaction] = useState(false);
  const [formReactionDetails, setFormReactionDetails] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Group by date
  const grouped = vaccines.reduce(
    (acc, v) => {
      const key = v.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    },
    {} as Record<string, Vaccine[]>
  );
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const openNew = () => {
    setEditingVaccine(null);
    setFormName("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormDose("1a dose");
    setFormManufacturer("");
    setFormLocation("");
    setFormReaction(false);
    setFormReactionDetails("");
    setFormNotes("");
    setDetailVaccine(null);
    setDrawerOpen(true);
  };

  const openEdit = (v: Vaccine) => {
    setEditingVaccine(v);
    setFormName(v.name);
    setFormDate(v.date);
    setFormDose(v.dose);
    setFormManufacturer(v.manufacturer);
    setFormLocation(v.location);
    setFormReaction(v.hadReaction);
    setFormReactionDetails(v.reactionDetails);
    setFormNotes(v.notes);
    setDetailVaccine(null);
    setDrawerOpen(true);
  };

  const openDetail = (v: Vaccine) => {
    setDetailVaccine(v);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const entry: Vaccine = {
      id: editingVaccine?.id || Date.now().toString(),
      name: formName,
      date: formDate,
      dose: formDose,
      manufacturer: formManufacturer,
      location: formLocation,
      hadReaction: formReaction,
      reactionDetails: formReactionDetails,
      notes: formNotes,
    };
    if (editingVaccine) {
      const next = vaccines.map((v) => (v.id === entry.id ? entry : v));
      setVaccines(next);
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { vaccines: next }).catch((e) => console.error(e));
      }
    } else {
      const next = [...vaccines, entry].sort((a, b) => a.date.localeCompare(b.date));
      setVaccines(next);
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { vaccines: next }).catch((e) => console.error(e));
      }
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = vaccines.filter((v) => v.id !== id);
    setVaccines(next);
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { vaccines: next }).catch((e) => console.error(e));
    }
    setDeleteConfirm(null);
    setDrawerOpen(false);
  };

  const reactionsCount = vaccines.filter((v) => v.hadReaction).length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/my-baby/health")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Caderneta de Vacinacao</h2>
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
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-baby-mint/30 flex items-center justify-center">
            <Syringe className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl">{vaccines.length}</p>
            <p className="text-xs text-muted-foreground">vacinas registradas</p>
          </div>
          {reactionsCount > 0 && (
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-baby-yellow/40 flex items-center justify-center mx-auto mb-0.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-[10px] text-muted-foreground">{reactionsCount} reacao</p>
            </div>
          )}
        </div>
      </div>

      {/* Vaccine list by date */}
      <div className="px-4 space-y-3">
        {sortedDates.map((date) => {
          const items = grouped[date];
          const d = new Date(date + "T12:00:00");
          return (
            <div key={date} className="bg-card rounded-3xl shadow-sm border border-border/50 overflow-hidden">
              <div className="px-5 py-3 bg-secondary/30 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">
                  {items.length} {items.length === 1 ? "vacina" : "vacinas"}
                </span>
              </div>
              <div className="px-5 py-2 space-y-1">
                {items.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => openDetail(v)}
                    className="w-full flex items-center gap-3 py-2.5 text-left active:scale-[0.99] transition-transform"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${v.hadReaction ? "bg-baby-yellow/40" : "bg-baby-mint/20"}`}>
                      <Syringe className={`w-3.5 h-3.5 ${v.hadReaction ? "text-amber-500" : "text-primary"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{v.name}</p>
                      <p className="text-[10px] text-muted-foreground">{v.dose}</p>
                    </div>
                    {v.hadReaction && (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail / Add / Edit Drawer */}
      <TrackerDrawer
        open={drawerOpen}
        onOpenChange={(o) => {
          setDrawerOpen(o);
          if (!o) {
            setDetailVaccine(null);
            setEditingVaccine(null);
          }
        }}
        title={
          detailVaccine
            ? detailVaccine.name
            : editingVaccine
              ? "Editar Vacina"
              : "Nova Vacina"
        }
      >
              {detailVaccine ? (
                /* --- Detail View --- */
                <div className="space-y-4">
                  <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(detailVaccine.date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Syringe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{detailVaccine.dose}</span>
                    </div>
                    {detailVaccine.manufacturer && (
                      <div className="flex items-center gap-2">
                        <Syringe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Fabricante: {detailVaccine.manufacturer}</span>
                      </div>
                    )}
                    {detailVaccine.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{detailVaccine.location}</span>
                      </div>
                    )}
                  </div>

                  {detailVaccine.hadReaction && (
                    <div className="bg-baby-yellow/20 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <p className="text-sm text-amber-700">Houve reacao</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{detailVaccine.reactionDetails}</p>
                    </div>
                  )}

                  {detailVaccine.notes && (
                    <div className="bg-secondary/30 rounded-2xl p-4">
                      <p className="text-xs text-muted-foreground">{detailVaccine.notes}</p>
                    </div>
                  )}

                  {/* Photo placeholder */}
                  <button className="w-full border-2 border-dashed border-border rounded-2xl py-6 flex flex-col items-center gap-2 text-muted-foreground/50">
                    <Camera className="w-5 h-5" />
                    <span className="text-xs">Adicionar foto do comprovante</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEdit(detailVaccine)}
                      className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    {deleteConfirm === detailVaccine.id ? (
                      <button
                        onClick={() => handleDelete(detailVaccine.id)}
                        className="flex-1 py-3 rounded-2xl bg-destructive/20 text-destructive text-sm flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Confirmar
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(detailVaccine.id)}
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
                    <label className="text-xs text-muted-foreground mb-2 block">Nome da vacina</label>
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Pentavalente"
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Data</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Dose</label>
                      <input
                        value={formDose}
                        onChange={(e) => setFormDose(e.target.value)}
                        placeholder="1a dose"
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Fabricante</label>
                    <input
                      value={formManufacturer}
                      onChange={(e) => setFormManufacturer(e.target.value)}
                      placeholder="Ex: Butantan"
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Local de aplicacao</label>
                    <input
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Ex: UBS Centro"
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Reaction toggle */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Houve reacao?</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormReaction(false)}
                        className={`flex-1 py-2.5 rounded-2xl text-xs transition-all ${!formReaction ? "bg-baby-mint/30 text-primary ring-1 ring-primary/20" : "bg-secondary text-foreground/60"}`}
                      >
                        Nao
                      </button>
                      <button
                        onClick={() => setFormReaction(true)}
                        className={`flex-1 py-2.5 rounded-2xl text-xs transition-all ${formReaction ? "bg-baby-yellow/40 text-amber-600 ring-1 ring-amber-200" : "bg-secondary text-foreground/60"}`}
                      >
                        Sim
                      </button>
                    </div>
                  </div>

                  {formReaction && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Detalhes da reacao</label>
                      <textarea
                        value={formReactionDetails}
                        onChange={(e) => setFormReactionDetails(e.target.value)}
                        placeholder="Ex: Febre baixa por 24h..."
                        rows={2}
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Observacoes</label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Anotacoes extras..."
                      rows={2}
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {/* Photo placeholder */}
                  <button className="w-full border-2 border-dashed border-border rounded-2xl py-4 flex flex-col items-center gap-2 text-muted-foreground/50">
                    <Camera className="w-5 h-5" />
                    <span className="text-xs">Adicionar foto</span>
                  </button>

                  <button
                    onClick={handleSave}
                    className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Check className="w-4 h-4" />
                    {editingVaccine ? "Salvar" : "Registrar"}
                  </button>
                </div>
              )}
      </TrackerDrawer>
    </div>
  );
}
