import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Plus,
  Weight,
  Ruler,
  CircleDot,
  Check,
  Pencil,
  Trash2,
  Info,
} from "lucide-react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { TrackerDrawer } from "../TrackerDrawer";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { getBabyUiState, putBabyUiState } from "@/api/client";

// --- Types ---
type Metric = "weight" | "height" | "head";

interface GrowthEntry {
  id: string;
  date: string;
  weight: number;
  height: number;
  head: number;
}

type TimeFilterKey = "3m" | "6m" | "1a" | "Tudo";

export function GrowthPage() {
  const navigate = useNavigate();
  const { data, babyId, canPersist } = useUIBootstrap();

  const percentileBands = (data?.growth?.percentileBands ?? {
    weight: [],
    height: [],
    head: [],
  }) as Record<Metric, { month: number; p3: number; p15: number; p50: number; p85: number; p97: number }[]>;

  const timeFilters = (data?.growth?.timeFilters ?? ["3m", "6m", "1a", "Tudo"]) as TimeFilterKey[];

  const metricConfig = useMemo(() => {
    type Mc = Record<
      Metric,
      {
        label: string;
        unit: string;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
        chartColor: string;
      }
    >;
    const raw = (data?.catalogs?.metricConfig ?? {}) as Record<
      string,
      { label: string; unit: string; icon: string; color: string; chartColor: string }
    >;
    const out = {} as Mc;
    (["weight", "height", "head"] as Metric[]).forEach((k) => {
      const r = raw[k];
      if (r) {
        out[k] = { ...r, icon: getIcon(r.icon) };
      }
    });
    return out;
  }, [data?.catalogs?.metricConfig]);

  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  useEffect(() => {
    if (!data) return;
    if (!canPersist || !babyId) {
      const e = data.growth?.initialEntries as GrowthEntry[] | undefined;
      if (e?.length) setEntries(e);
      return;
    }
    void getBabyUiState(babyId)
      .then((s) => {
        const ge = s.growth_entries as GrowthEntry[] | undefined;
        if (ge?.length) setEntries(ge);
        else {
          const e = data.growth?.initialEntries as GrowthEntry[] | undefined;
          if (e?.length) setEntries(e);
          else setEntries([]);
        }
      })
      .catch(() => {
        const e = data.growth?.initialEntries as GrowthEntry[] | undefined;
        if (e?.length) setEntries(e);
      });
  }, [data, babyId, canPersist]);

  const persistEntries = (next: GrowthEntry[]) => {
    if (canPersist && babyId) {
      void putBabyUiState(babyId, { growth_entries: next }).catch((e) => console.error(e));
    }
  };

  const [activeMetric, setActiveMetric] = useState<Metric>("weight");
  const [timeFilter, setTimeFilter] = useState<TimeFilterKey>("Tudo");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<GrowthEntry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPercentileInfo, setShowPercentileInfo] = useState(false);

  // Form
  const [formDate, setFormDate] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formHeight, setFormHeight] = useState("");
  const [formHead, setFormHead] = useState("");

  const mc = metricConfig[activeMetric] ?? {
    label: "",
    unit: "",
    icon: Weight,
    color: "bg-secondary",
    chartColor: "#999999",
  };
  const latest = entries.length ? entries[entries.length - 1] : null;

  // Filter entries by time
  const filteredEntries = entries.filter((e) => {
    if (timeFilter === "Tudo") return true;
    const d = new Date(e.date + "T12:00:00");
    const now = new Date();
    const monthsBack = timeFilter === "3m" ? 3 : timeFilter === "6m" ? 6 : 12;
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - monthsBack);
    return d >= cutoff;
  });

  // Calculate baby age in months for each entry (birth: 2025-08-05)
  const birthDate = new Date(2025, 7, 5);
  const chartData = filteredEntries.map((e) => {
    const d = new Date(e.date + "T12:00:00");
    const months = (d.getFullYear() - birthDate.getFullYear()) * 12 + (d.getMonth() - birthDate.getMonth());
    return {
      month: months,
      label: `${months}m`,
      value: e[activeMetric],
    };
  });

  // Percentile band data for chart
  const bands = percentileBands[activeMetric];
  const minMonth = chartData.length ? Math.max(0, chartData[0].month - 1) : 0;
  const maxMonth = chartData.length ? chartData[chartData.length - 1].month + 1 : 12;
  const bandData = bands
    .filter((b) => b.month >= minMonth && b.month <= maxMonth)
    .map((b) => ({
      month: b.month,
      label: `${b.month}m`,
      p3: b.p3,
      p15: b.p15,
      p50: b.p50,
      p85: b.p85,
      p97: b.p97,
    }));

  // Merge baby data with band data
  const mergedData = bandData.map((b) => {
    const babyPoint = chartData.find((c) => c.month === b.month);
    return { ...b, baby: babyPoint?.value ?? null };
  });
  // Add any baby points not already in band months
  chartData.forEach((c) => {
    if (!mergedData.find((m) => m.month === c.month)) {
      const band = bands.find((b) => b.month === c.month);
      mergedData.push({
        month: c.month,
        label: c.label,
        p3: band?.p3 ?? 0,
        p15: band?.p15 ?? 0,
        p50: band?.p50 ?? 0,
        p85: band?.p85 ?? 0,
        p97: band?.p97 ?? 0,
        baby: c.value,
      });
    }
  });
  mergedData.sort((a, b) => a.month - b.month);

  // Current percentile estimate
  const latestMonth = chartData.length ? chartData[chartData.length - 1].month : 0;
  const latestValue = chartData.length ? chartData[chartData.length - 1].value : 0;
  const closestBand = bands.length > 0
    ? bands.reduce((prev, curr) =>
        Math.abs(curr.month - latestMonth) < Math.abs(prev.month - latestMonth) ? curr : prev
      )
    : { month: 0, p3: 0, p15: 0, p50: 0, p85: 0, p97: 0 };
  const estimatePercentile = () => {
    if (latestValue <= closestBand.p3) return 3;
    if (latestValue <= closestBand.p15) return Math.round(3 + ((latestValue - closestBand.p3) / (closestBand.p15 - closestBand.p3)) * 12);
    if (latestValue <= closestBand.p50) return Math.round(15 + ((latestValue - closestBand.p15) / (closestBand.p50 - closestBand.p15)) * 35);
    if (latestValue <= closestBand.p85) return Math.round(50 + ((latestValue - closestBand.p50) / (closestBand.p85 - closestBand.p50)) * 35);
    if (latestValue <= closestBand.p97) return Math.round(85 + ((latestValue - closestBand.p85) / (closestBand.p97 - closestBand.p85)) * 12);
    return 97;
  };
  const percentile = estimatePercentile();

  const openNew = () => {
    setEditingEntry(null);
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormWeight("");
    setFormHeight("");
    setFormHead("");
    setDrawerOpen(true);
  };

  const openEdit = (entry: GrowthEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormWeight(entry.weight.toString());
    setFormHeight(entry.height.toString());
    setFormHead(entry.head.toString());
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const entry: GrowthEntry = {
      id: editingEntry?.id || Date.now().toString(),
      date: formDate,
      weight: parseFloat(formWeight) || 0,
      height: parseFloat(formHeight) || 0,
      head: parseFloat(formHead) || 0,
    };
    if (editingEntry) {
      const next = entries.map((e) => (e.id === entry.id ? entry : e));
      setEntries(next);
      persistEntries(next);
    } else {
      const next = [...entries, entry].sort((a, b) => a.date.localeCompare(b.date));
      setEntries(next);
      persistEntries(next);
    }
    setDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    persistEntries(next);
    setDeleteConfirm(null);
  };

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/my-baby")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2>Crescimento</h2>
        </div>
        <button
          onClick={openNew}
          className="bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Metric tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          {(Object.keys(metricConfig) as Metric[]).map((m) => {
            const c = metricConfig[m];
            const Icon = c.icon;
            return (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`flex-1 py-3 rounded-2xl text-xs flex flex-col items-center gap-1.5 transition-all ${
                  activeMetric === m
                    ? `${c.color} ring-1 ring-border shadow-sm`
                    : "bg-secondary/60"
                }`}
              >
                <Icon className="w-4 h-4 text-foreground/60" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current value summary */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 text-center">
          <p className="text-4xl" style={{ color: mc.chartColor }}>
            {latest?.[activeMetric] ?? "--"}
            <span className="text-lg text-muted-foreground ml-1">{mc.unit}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ultima medicao
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percentile}%`, backgroundColor: mc.chartColor }}
              />
            </div>
            <span className="text-xs text-muted-foreground">P{percentile}</span>
            <button onClick={() => setShowPercentileInfo(!showPercentileInfo)} className="p-0.5">
              <Info className="w-3.5 h-3.5 text-muted-foreground/50" />
            </button>
          </div>
          {showPercentileInfo && (
            <p className="text-[10px] text-muted-foreground mt-2 bg-secondary/50 rounded-xl p-2.5 text-left">
              O percentil indica a posicao do seu bebe em relacao a outras
              criancas da mesma idade. P{percentile} significa que o{" "}
              {mc.label.toLowerCase()} esta dentro da faixa esperada. Cada bebe
              cresce no seu proprio ritmo.
            </p>
          )}
        </div>
      </div>

      {/* Time filter */}
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          {timeFilters.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                timeFilter === tf
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground/60"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart with percentile bands */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-4 shadow-sm border border-border/50">
          <p className="text-xs text-muted-foreground mb-3">
            {mc.label} ({mc.unit}) — com faixas de percentil
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={mergedData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#8E8E9A" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#8E8E9A" }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.08)",
                    fontSize: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                />
                {/* Percentile bands */}
                <Area key="area-p97" dataKey="p97" fill="rgba(0,0,0,0.03)" stroke="none" />
                <Area key="area-p85" dataKey="p85" fill="rgba(0,0,0,0.03)" stroke="none" />
                <Area key="area-p50" dataKey="p50" fill="rgba(0,0,0,0.03)" stroke="none" />
                <Area key="area-p15" dataKey="p15" fill="rgba(0,0,0,0.02)" stroke="none" />
                <Area key="area-p3" dataKey="p3" fill="transparent" stroke="none" />
                {/* Percentile lines */}
                <Line key="line-p97" dataKey="p97" stroke="#e0e0e0" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                <Line key="line-p50" dataKey="p50" stroke="#bdbdbd" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                <Line key="line-p3" dataKey="p3" stroke="#e0e0e0" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                {/* Baby line */}
                <Line
                  dataKey="baby"
                  stroke={mc.chartColor}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: mc.chartColor, stroke: "#fff", strokeWidth: 2 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: mc.chartColor }} />
              <span className="text-[10px] text-muted-foreground">{mc.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded-full bg-muted-foreground/20 border-dashed" />
              <span className="text-[10px] text-muted-foreground">P3 / P50 / P97</span>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-3">Historico de medicoes</p>
          <div className="space-y-1">
            {[...filteredEntries].sort((a, b) => b.date.localeCompare(a.date)).map((e) => {
              const d = new Date(e.date + "T12:00:00");
              return (
                <div key={e.id} className="flex items-center gap-3 py-2.5 group">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">
                    {d.getFullYear() !== new Date().getFullYear()
                      ? `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
                      : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Weight className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs">{e.weight} kg</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs">{e.height} cm</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CircleDot className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-xs">{e.head} cm</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <TrackerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={`${editingEntry ? "Editar" : "Nova"} Medicao`}
      >
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">Data</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="8.2"
                    className="w-full bg-secondary rounded-2xl px-3 py-3 text-sm outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Altura (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formHeight}
                    onChange={(e) => setFormHeight(e.target.value)}
                    placeholder="70"
                    className="w-full bg-secondary rounded-2xl px-3 py-3 text-sm outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Cabeca (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formHead}
                    onChange={(e) => setFormHead(e.target.value)}
                    placeholder="44"
                    className="w-full bg-secondary rounded-2xl px-3 py-3 text-sm outline-none text-center"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Check className="w-4 h-4" />
                {editingEntry ? "Salvar" : "Registrar"}
              </button>
      </TrackerDrawer>
    </div>
  );
}