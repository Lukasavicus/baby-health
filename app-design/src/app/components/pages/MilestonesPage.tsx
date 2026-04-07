import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  Sparkles,
  X,
  Check,
  Clock,
  ChevronDown,
  ChevronRight,
  Smile,
} from "lucide-react";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";

// --- Types ---
type MilestoneStatus = "observed" | "emerging" | "not_yet";

interface Milestone {
  id: string;
  title: string;
  description: string;
  ageRange: string; // e.g. "4-6 meses"
  category: string;
  status: MilestoneStatus;
  observedDate?: string;
  notes?: string;
}

interface MilestoneCategory {
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export function MilestonesPage() {
  const navigate = useNavigate();
  const { data, babyId, canPersist } = useUIBootstrap();

  const categories: MilestoneCategory[] = useMemo(() => {
    const raw = (data?.catalogs?.milestoneCategories ?? []) as {
      id: string;
      label: string;
      icon: string;
      color: string;
      bgColor: string;
    }[];
    return raw.map((c) => ({ ...c, Icon: getIcon(c.icon) }));
  }, [data?.catalogs?.milestoneCategories]);

  const catMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])) as Record<string, MilestoneCategory>,
    [categories],
  );

  const statusConfig = (data?.catalogs?.milestoneStatusConfig ?? {
    observed: { label: "Observado", color: "text-primary", bgColor: "bg-primary/10" },
    emerging: { label: "Comecando", color: "text-amber-600", bgColor: "bg-baby-yellow/50" },
    not_yet: { label: "Ainda nao", color: "text-muted-foreground", bgColor: "bg-secondary" },
  }) as Record<MilestoneStatus, { label: string; color: string; bgColor: string }>;

  const ageWindows = (data?.milestones?.ageWindows ?? []) as string[];

  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (!data) return;
    if (!canPersist || !babyId) {
      const m = data.milestones?.initialMilestones as Milestone[] | undefined;
      if (m?.length) setMilestones(m);
      return;
    }
    void getBabyUiState(babyId)
      .then((s) => {
        const stored = s.milestones as Milestone[] | undefined;
        if (stored?.length) setMilestones(stored);
        else {
          const m = data.milestones?.initialMilestones as Milestone[] | undefined;
          if (m?.length) setMilestones(m);
          else setMilestones([]);
        }
      })
      .catch(() => {
        const m = data.milestones?.initialMilestones as Milestone[] | undefined;
        if (m?.length) setMilestones(m);
      });
  }, [data, babyId, canPersist]);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [expandedWindows, setExpandedWindows] = useState<Set<string>>(
    new Set(["6-9 meses", "9-12 meses"])
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formStatus, setFormStatus] = useState<MilestoneStatus>("not_yet");
  const [formDate, setFormDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const toggleWindow = (w: string) => {
    setExpandedWindows((prev) => {
      const next = new Set(prev);
      if (next.has(w)) next.delete(w);
      else next.add(w);
      return next;
    });
  };

  const filtered = filterCat
    ? milestones.filter((m) => m.category === filterCat)
    : milestones;

  const openEdit = (m: Milestone) => {
    setEditingMilestone(m);
    setFormStatus(m.status);
    setFormDate(m.observedDate || "");
    setFormNotes(m.notes || "");
    setDrawerOpen(true);
  };

  const handleSave = () => {
    if (!editingMilestone) return;
    setMilestones((prev) => {
      const next = prev.map((m) =>
        m.id === editingMilestone.id
          ? { ...m, status: formStatus, observedDate: formDate || undefined, notes: formNotes || undefined }
          : m,
      );
      if (canPersist && babyId) {
        void putBabyUiState(babyId, { milestones: next }).catch((e) => console.error(e));
      }
      return next;
    });
    setDrawerOpen(false);
  };

  // Stats
  const total = milestones.length;
  const observed = milestones.filter((m) => m.status === "observed").length;
  const emerging = milestones.filter((m) => m.status === "emerging").length;

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-2 flex items-center gap-3">
        <button onClick={() => navigate("/my-baby")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2>Marcos & Conquistas</h2>
      </div>

      {/* Warm message */}
      <div className="px-5 mb-4">
        <p className="text-xs text-muted-foreground">
          Cada bebe se desenvolve no seu proprio tempo. Aqui voce registra o que observou, criando uma memoria carinhosa da jornada.
        </p>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-1.5">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="text-lg">{observed}</p>
              <p className="text-[10px] text-muted-foreground">observados</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-baby-yellow/40 flex items-center justify-center mx-auto mb-1.5">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-lg">{emerging}</p>
              <p className="text-[10px] text-muted-foreground">comecando</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-1.5">
                <Smile className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-lg">{total - observed - emerging}</p>
              <p className="text-[10px] text-muted-foreground">no tempo dele</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="px-4 mb-4 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          <button
            onClick={() => setFilterCat(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 transition-all ${
              !filterCat ? "bg-primary text-white" : "bg-secondary text-foreground/60"
            }`}
          >
            Todos
          </button>
          {categories.map((c) => {
            const Icon = c.Icon;
            return (
              <button
                key={c.id}
                onClick={() => setFilterCat(filterCat === c.id ? null : c.id)}
                className={`px-3 py-1.5 rounded-full text-xs shrink-0 transition-all flex items-center gap-1.5 ${
                  filterCat === c.id ? `${c.bgColor} ${c.color} ring-1 ring-current/20` : "bg-secondary text-foreground/60"
                }`}
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Milestones by age window */}
      <div className="px-4 space-y-3">
        {ageWindows.map((window) => {
          const items = filtered.filter((m) => m.ageRange === window);
          if (items.length === 0) return null;
          const isExpanded = expandedWindows.has(window);
          const observedCount = items.filter((m) => m.status === "observed").length;

          return (
            <div key={window} className="bg-card rounded-3xl shadow-sm border border-border/50 overflow-hidden">
              <button
                onClick={() => toggleWindow(window)}
                className="w-full flex items-center gap-3 py-4 px-5"
              >
                <div className="flex-1 text-left">
                  <p className="text-sm">{window}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {observedCount} de {items.length} observados
                  </p>
                </div>
                {/* Mini progress */}
                <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all"
                    style={{ width: `${items.length > 0 ? (observedCount / items.length) * 100 : 0}%` }}
                  />
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-2.5">
                  {items.map((m) => {
                    const cat = catMap[m.category];
                    const st = statusConfig[m.status];
                    const CatIcon = cat?.Icon || Sparkles;
                    return (
                      <button
                        key={m.id}
                        onClick={() => openEdit(m)}
                        className="w-full flex items-start gap-3 py-2.5 text-left active:scale-[0.99] transition-transform"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            m.status === "observed"
                              ? "bg-primary/15"
                              : m.status === "emerging"
                                ? "bg-baby-yellow/40"
                                : "bg-secondary"
                          }`}
                        >
                          {m.status === "observed" ? (
                            <Sparkles className="w-4 h-4 text-primary" />
                          ) : m.status === "emerging" ? (
                            <Clock className="w-4 h-4 text-amber-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/25" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${m.status === "not_yet" ? "text-muted-foreground" : ""}`}>
                            {m.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{m.description}</p>
                          {m.observedDate && (
                            <p className="text-[10px] text-primary/70 mt-0.5">
                              Observado em{" "}
                              {new Date(m.observedDate).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          )}
                          {m.notes && (
                            <p className="text-[10px] text-muted-foreground italic mt-0.5">
                              {m.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {cat && (
                            <div className={`w-5 h-5 rounded-full ${cat.bgColor} flex items-center justify-center`}>
                              <CatIcon className={`w-2.5 h-2.5 ${cat.color}`} />
                            </div>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.bgColor} ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Drawer */}
      <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">Atualizar Marco</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setDrawerOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>Registrar observacao</h3>
                <div className="w-5" />
              </div>

              {editingMilestone && (
                <>
                  {/* Milestone info */}
                  <div className="bg-secondary/50 rounded-2xl p-4 mb-5">
                    <p className="text-sm">{editingMilestone.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {editingMilestone.description}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Periodo comum: {editingMilestone.ageRange}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="mb-5">
                    <label className="text-xs text-muted-foreground mb-2 block">
                      O que voce observou?
                    </label>
                    <div className="space-y-2">
                      {(
                        [
                          { value: "observed" as MilestoneStatus, label: "Ja faz!", sublabel: "Observei que ja consegue", icon: Sparkles, color: "bg-primary/10 text-primary ring-primary/20" },
                          { value: "emerging" as MilestoneStatus, label: "Comecando", sublabel: "Esta tentando, quase la", icon: Clock, color: "bg-baby-yellow/30 text-amber-600 ring-amber-200" },
                          { value: "not_yet" as MilestoneStatus, label: "Ainda nao", sublabel: "Cada um no seu tempo", icon: Smile, color: "bg-secondary text-muted-foreground ring-border" },
                        ] as const
                      ).map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => setFormStatus(opt.value)}
                            className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl transition-all ${
                              formStatus === opt.value
                                ? `${opt.color} ring-1`
                                : "bg-secondary/40"
                            }`}
                          >
                            <Icon className="w-5 h-5 shrink-0" />
                            <div className="text-left">
                              <p className="text-sm">{opt.label}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {opt.sublabel}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date observed */}
                  {formStatus === "observed" && (
                    <div className="mb-5">
                      <label className="text-xs text-muted-foreground mb-2 block">
                        Quando voce percebeu? (opcional)
                      </label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mb-6">
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Anotacoes (opcional)
                    </label>
                    <textarea
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      placeholder="Ex: Comecou a tentar durante a brincadeira..."
                      rows={3}
                      className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none resize-none placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Check className="w-4 h-4" />
                    Salvar
                  </button>
                </>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
