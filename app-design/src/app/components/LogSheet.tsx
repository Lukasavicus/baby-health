import { useState, useEffect, useMemo } from "react";
import { Drawer } from "vaul";
import { Minus, Plus, X, Check, Thermometer } from "lucide-react";
import { TimePickerField } from "./TimePickerDialog";
import { getIcon } from "../iconMap";
import { useUIBootstrap } from "../UIBootstrapContext";

export type LogCategory = "feeding" | "hydration" | "sleep" | "diaper" | "activity" | "bath" | "health" | null;

type VolumeLevel = 1 | 2 | 3 | 4;

interface LogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLog: (entry: any) => void | Promise<void>;
  initialCategory?: LogCategory;
  initialSubType?: string;
}

function nowTime() {
  const n = new Date();
  return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
}

function calcDurationMin(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

function formatDuration(mins: number): string {
  if (mins <= 0) return "--";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}min`;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function LogSheet({ open, onOpenChange, onLog, initialCategory = null, initialSubType = "" }: LogSheetProps) {
  const { data } = useUIBootstrap();
  const catalogs = data?.catalogs;

  const logTypes = useMemo(() => {
    const raw = (catalogs?.logTypes ?? []) as {
      id: string;
      label: string;
      icon: string;
      color: string;
    }[];
    return raw.map((t) => ({
      id: t.id as LogCategory,
      label: t.label,
      color: t.color,
      Icon: getIcon(t.icon),
    }));
  }, [catalogs]);

  const feedingTypes = (catalogs?.feedingTypes ?? []) as { id: string; label: string }[];
  const formulaBrands = (catalogs?.formulaBrands ?? []) as string[];
  const drinkTypes = useMemo(
    () =>
      ((catalogs?.drinkTypes ?? []) as { id: string; label: string; icon: string }[]).map((t) => ({
        ...t,
        Icon: getIcon(t.icon),
      })),
    [catalogs],
  );
  const quickAmounts = (catalogs?.quickAmounts ?? []) as number[];
  const sleepTypes = useMemo(
    () =>
      ((catalogs?.sleepTypes ?? []) as { id: "night" | "nap"; label: string; icon: string }[]).map((t) => ({
        ...t,
        Icon: getIcon(t.icon),
      })),
    [catalogs],
  );
  const sleepLocations = (catalogs?.sleepLocations ?? []) as string[];
  const diaperTypes = (catalogs?.diaperTypes ?? []) as { id: string; label: string }[];
  const vlRaw = (catalogs?.volumeLabelsLogSheet ?? catalogs?.volumeLabels ?? {}) as Record<string, string>;
  const volumeLabels: Record<VolumeLevel, string> = {
    1: vlRaw["1"] ?? "Pouco",
    2: vlRaw["2"] ?? "Normal",
    3: vlRaw["3"] ?? "Bastante",
    4: vlRaw["4"] ?? "Muito",
  };
  const bathTemps = (catalogs?.bathTemps ?? []) as { id: string; label: string; icon: string }[];
  const bathDurations = (catalogs?.bathDurations ?? []) as number[];
  const activityTypes = useMemo(
    () =>
      ((catalogs?.activityTypes ?? []) as { id: string; label: string; icon: string }[]).map((t) => ({
        ...t,
        Icon: getIcon(t.icon),
      })),
    [catalogs],
  );
  const healthSubTypes = (catalogs?.healthSubTypes ?? []) as { id: string; label: string }[];

  const [selected, setSelected] = useState<LogCategory>(null);
  // Common
  const [formTime, setFormTime] = useState("");
  const [notes, setNotes] = useState("");
  // Feeding
  const [feedType, setFeedType] = useState("breast");
  const [feedSide, setFeedSide] = useState("");
  const [feedDuration, setFeedDuration] = useState(10);
  const [feedAmount, setFeedAmount] = useState(120);
  const [feedFormula, setFeedFormula] = useState("");
  // Hydration
  const [hydType, setHydType] = useState("water");
  const [hydAmount, setHydAmount] = useState(60);
  // Sleep
  const [sleepType, setSleepType] = useState("nap");
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [sleepLocation, setSleepLocation] = useState("");
  // Diaper
  const [diaperType, setDiaperType] = useState("pee");
  const [peeVol, setPeeVol] = useState<VolumeLevel>(2);
  const [pooVol, setPooVol] = useState<VolumeLevel>(2);
  // Bath
  const [bathTemp, setBathTemp] = useState("morno");
  const [bathDuration, setBathDuration] = useState(15);
  // Activity
  const [actType, setActType] = useState("");
  const [actDuration, setActDuration] = useState(15);
  // Health
  const [healthType, setHealthType] = useState("");
  const [healthName, setHealthName] = useState("");
  const [healthDosage, setHealthDosage] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(initialCategory);
      setFormTime(nowTime());
      setNotes("");
      // Apply initialSubType for feeding
      if (initialCategory === "feeding" && initialSubType) {
        const feedMap: Record<string, { type: string; side: string; brand: string }> = {
          breast: { type: "breast", side: "", brand: "" },
          formula: { type: "formula", side: "", brand: "Mamadeira" },
          solids: { type: "solids", side: "", brand: "" },
        };
        const mapped = feedMap[initialSubType];
        if (mapped) {
          setFeedType(mapped.type);
          setFeedSide(mapped.side);
          setFeedFormula(mapped.brand);
        } else {
          setFeedType(initialSubType);
          setFeedSide("");
        }
      } else {
        setFeedType("breast");
        setFeedSide("");
      }
      setFeedDuration(10);
      setFeedAmount(120);
      setFeedFormula("");
      setHydType("water");
      setHydAmount(60);
      setSleepType("nap");
      setSleepStart(nowTime());
      setSleepEnd("");
      setSleepLocation("");
      setDiaperType("pee");
      setPeeVol(2);
      setPooVol(2);
      setBathTemp("morno");
      setBathDuration(15);
      // Apply initialSubType for activity
      setActType(initialCategory === "activity" && initialSubType ? initialSubType : "");
      setActDuration(15);
      setHealthType("");
      setHealthName("");
      setHealthDosage("");
    }
  }, [open, initialCategory, initialSubType]);

  const handleSave = async () => {
    const now = new Date();
    const entry: any = {
      type: selected,
      notes,
      time: formTime || nowTime(),
      timestamp: now,
      caregiver: "Mamãe",
    };

    switch (selected) {
      case "feeding":
        entry.subType = feedType;
        entry.feedSide = feedSide;
        entry.duration = feedDuration;
        entry.quantity = feedAmount;
        entry.formulaBrand = feedFormula;
        break;
      case "hydration":
        entry.subType = hydType;
        entry.quantity = hydAmount;
        break;
      case "sleep":
        entry.subType = sleepType;
        entry.sleepStart = sleepStart;
        entry.sleepEnd = sleepEnd;
        entry.sleepLocation = sleepLocation;
        break;
      case "diaper":
        entry.subType = diaperType;
        entry.peeVolume = peeVol;
        entry.pooVolume = pooVol;
        break;
      case "bath":
        entry.subType = bathTemp;
        entry.duration = bathDuration;
        break;
      case "activity":
        entry.subType = actType;
        entry.duration = actDuration;
        break;
      case "health":
        entry.subType = healthType;
        entry.healthName = healthName;
        entry.healthDosage = healthDosage;
        break;
    }

    await Promise.resolve(onLog(entry));
    onOpenChange(false);
  };

  const handleBack = () => {
    if (initialCategory) {
      onOpenChange(false);
    } else {
      setSelected(null);
    }
  };

  const renderCategoryForm = () => {
    switch (selected) {
      // ==================== FEEDING ====================
      case "feeding":
        return (
          <>
            {/* Horário */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
              <TimePickerField
                value={formTime}
                onChange={setFormTime}
                className="w-full bg-secondary rounded-xl p-3 text-sm outline-none"
              />
            </div>
            {/* Tipo */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Tipo</p>
              <div className="flex flex-wrap gap-2">
                {feedingTypes.map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => setFeedType(ft.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      feedType === ft.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Breast: Side + Duration */}
            {feedType === "breast" && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Lado</p>
                  <div className="flex gap-2">
                    {["Esquerdo", "Direito", "Ambos"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFeedSide(s)}
                        className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${
                          feedSide === s
                            ? "bg-baby-peach text-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Duração (min)</p>
                  <div className="flex items-center gap-4 justify-center">
                    <button
                      onClick={() => setFeedDuration(Math.max(1, feedDuration - 1))}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-3xl w-16 text-center">{feedDuration}</span>
                    <button
                      onClick={() => setFeedDuration(feedDuration + 1)}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
            {/* Formula: Quantity */}
            {feedType === "formula" && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Quantidade (ml)</p>
                <div className="flex items-center gap-4 justify-center">
                  <button
                    onClick={() => setFeedAmount(Math.max(0, feedAmount - 30))}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl w-20 text-center">{feedAmount}</span>
                  <button
                    onClick={() => setFeedAmount(feedAmount + 30)}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {/* Formula brand */}
            {feedType === "formula" && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Marca da fórmula</p>
                <div className="flex flex-wrap gap-2">
                  {formulaBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setFeedFormula(brand)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        feedFormula === brand
                          ? "bg-baby-lavender text-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
                {feedFormula === "Outra" && (
                  <input
                    type="text"
                    placeholder="Nome da fórmula..."
                    className="w-full bg-secondary rounded-xl p-3 text-sm outline-none mt-2"
                    onChange={(e) => setFeedFormula(e.target.value)}
                  />
                )}
              </div>
            )}
            {/* Solids: Quantity in grams */}
            {feedType === "solids" && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Quantidade (g)</p>
                <div className="flex items-center gap-4 justify-center">
                  <button
                    onClick={() => setFeedAmount(Math.max(0, feedAmount - 10))}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-3xl w-20 text-center">{feedAmount}</span>
                  <button
                    onClick={() => setFeedAmount(feedAmount + 10)}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        );

      // ==================== HYDRATION ====================
      case "hydration":
        return (
          <>
            {/* Horário */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
              <TimePickerField value={formTime} onChange={setFormTime} />
            </div>
            {/* Tipo */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Tipo</p>
              <div className="flex flex-wrap gap-2">
                {drinkTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setHydType(t.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs transition-all ${
                      hydType === t.id
                        ? "bg-baby-blue text-white shadow-sm"
                        : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Quantidade */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Quantidade (ml)</p>
              <div className="flex items-center justify-center gap-4 mb-3">
                <button
                  onClick={() => setHydAmount(Math.max(10, hydAmount - 10))}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-3xl w-20 text-center">{hydAmount}</span>
                <button
                  onClick={() => setHydAmount(hydAmount + 10)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setHydAmount(amt)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                      hydAmount === amt ? "bg-baby-blue text-white" : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {amt} ml
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      // ==================== SLEEP ====================
      case "sleep":
        return (
          <>
            {/* Tipo */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Tipo</p>
              <div className="flex gap-2">
                {sleepTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSleepType(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs transition-all ${
                      sleepType === t.id
                        ? t.id === "night" ? "bg-baby-lavender text-white shadow-sm" : "bg-baby-blue text-white shadow-sm"
                        : "bg-secondary text-foreground/60"
                    }`}
                  >
                    <t.Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Início */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1.5">Início</p>
              <TimePickerField value={sleepStart} onChange={setSleepStart} />
            </div>
            {/* Fim */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1.5">Fim</p>
              <TimePickerField value={sleepEnd} onChange={setSleepEnd} />
            </div>
            {/* Duração calculada */}
            {sleepStart && sleepEnd && (
              <div className="mb-5 bg-secondary/50 rounded-2xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="text-lg">{formatDuration(calcDurationMin(sleepStart, sleepEnd))}</p>
              </div>
            )}
            {/* Local */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Local</p>
              <div className="flex flex-wrap gap-2">
                {sleepLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSleepLocation(sleepLocation === loc ? "" : loc)}
                    className={`px-4 py-2.5 rounded-2xl text-xs transition-all ${
                      sleepLocation === loc
                        ? "bg-baby-lavender text-white shadow-sm"
                        : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      // ==================== DIAPER ====================
      case "diaper":
        return (
          <>
            {/* Horário */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
              <TimePickerField value={formTime} onChange={setFormTime} />
            </div>
            {/* Tipo */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Tipo</p>
              <div className="flex gap-2">
                {diaperTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDiaperType(t.id)}
                    className={`flex-1 py-3 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 ${
                      diaperType === t.id
                        ? "bg-amber-300 text-amber-900 shadow-sm"
                        : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Pee volume */}
            {(diaperType === "pee" || diaperType === "mixed") && (
              <div className="mb-5">
                <p className="text-sm text-muted-foreground mb-2">Volume do Xixi</p>
                <div className="flex gap-2">
                  {([1, 2, 3, 4] as VolumeLevel[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setPeeVol(v)}
                      className={`flex-1 py-3 rounded-2xl text-xs transition-all flex flex-col items-center gap-1 ${
                        peeVol === v ? "bg-baby-blue/40 text-foreground shadow-sm" : "bg-secondary text-foreground/60"
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: v }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${peeVol === v ? "bg-baby-blue" : "bg-baby-blue/40"}`} />
                        ))}
                      </div>
                      <span>{volumeLabels[v]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Poo volume */}
            {(diaperType === "poo" || diaperType === "mixed") && (
              <div className="mb-5">
                <p className="text-sm text-muted-foreground mb-2">Volume do Cocô</p>
                <div className="flex gap-2">
                  {([1, 2, 3, 4] as VolumeLevel[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setPooVol(v)}
                      className={`flex-1 py-3 rounded-2xl text-xs transition-all flex flex-col items-center gap-1 ${
                        pooVol === v ? "bg-amber-200 text-amber-900 shadow-sm" : "bg-secondary text-foreground/60"
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {Array.from({ length: v }).map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${pooVol === v ? "bg-amber-400" : "bg-amber-400/40"}`} />
                        ))}
                      </div>
                      <span>{volumeLabels[v]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        );

      // ==================== ACTIVITY ====================
      case "activity":
        return (
          <>
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-3">Tipo de atividade</p>
              <div className="grid grid-cols-4 gap-3">
                {activityTypes.map((at) => (
                  <button
                    key={at.id}
                    onClick={() => setActType(at.id)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        actType === at.id
                          ? "bg-baby-mint/60"
                          : "bg-secondary"
                      }`}
                    >
                      <at.Icon className={`w-6 h-6 ${actType === at.id ? "text-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{at.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Duração (min)</p>
              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={() => setActDuration(Math.max(5, actDuration - 5))}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-3xl w-16 text-center">{actDuration}</span>
                <button
                  onClick={() => setActDuration(actDuration + 5)}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        );

      // ==================== BATH ====================
      case "bath":
        return (
          <>
            {/* Horário */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
              <TimePickerField value={formTime} onChange={setFormTime} />
            </div>
            {/* Temperatura */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Temperatura</p>
              <div className="flex gap-2">
                {bathTemps.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBathTemp(t.id)}
                    className={`flex-1 py-3 rounded-2xl text-xs transition-all flex flex-col items-center gap-1 ${
                      bathTemp === t.id
                        ? "bg-baby-blue text-white shadow-sm"
                        : "bg-secondary text-foreground/60"
                    }`}
                  >
                    <Thermometer className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Duração */}
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Duração (min)</p>
              <div className="flex gap-2 flex-wrap">
                {bathDurations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setBathDuration(d)}
                    className={`px-4 py-2.5 rounded-2xl text-xs transition-all ${
                      bathDuration === d
                        ? "bg-baby-blue text-white shadow-sm"
                        : "bg-secondary text-foreground/60"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      // ==================== HEALTH ====================
      case "health":
        return (
          <>
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-2">Tipo</p>
              <div className="flex gap-2">
                {healthSubTypes.map((ht) => (
                  <button
                    key={ht.id}
                    onClick={() => setHealthType(ht.id)}
                    className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${
                      healthType === ht.id
                        ? "bg-baby-pink text-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {ht.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1.5">Nome</p>
              <input
                type="text"
                value={healthName}
                onChange={(e) => setHealthName(e.target.value)}
                placeholder={healthType === "vitamin" ? "Ex: Vitamina D, Ferro..." : "Ex: Paracetamol, Dipirona..."}
                className="w-full bg-secondary rounded-xl p-3 text-sm outline-none"
              />
            </div>
            <div className="mb-5">
              <p className="text-sm text-muted-foreground mb-1.5">Dosagem</p>
              <input
                type="text"
                value={healthDosage}
                onChange={(e) => setHealthDosage(e.target.value)}
                placeholder="Ex: 5 gotas, 2.5 ml, 1 comprimido..."
                className="w-full bg-secondary rounded-xl p-3 text-sm outline-none"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const getCategoryTitle = () => {
    const cat = logTypes.find((t) => t.id === selected);
    if (!cat) return "Registrar";
    const titles: Record<string, string> = {
      feeding: "Nova Alimentação",
      hydration: "Nova Hidratação",
      sleep: "Novo Sono",
      diaper: "Nova Fralda",
      activity: "Nova Atividade",
      bath: "Novo Banho",
      health: "Novo Registro de Saúde",
    };
    return titles[selected!] || cat.label;
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] mx-auto max-w-md"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">Registrar</Drawer.Title>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
          <div className="px-5 pb-8 overflow-y-auto max-h-[80vh]">
            {!selected ? (
              <>
                <h2 className="mb-5">Registrar</h2>
                <div className="grid grid-cols-3 gap-3">
                  {logTypes.map((t) => {
                    const IconComp = t.Icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelected(t.id)}
                        className={`${t.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-transform active:scale-95`}
                      >
                        <IconComp className="w-7 h-7 text-foreground/70" />
                        <span className="text-xs text-foreground/80">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <button onClick={handleBack} className="p-1">
                    <X className="w-5 h-5" />
                  </button>
                  <h3>{getCategoryTitle()}</h3>
                  <div className="w-5" />
                </div>

                {renderCategoryForm()}

                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Notas</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicionar nota..."
                    className="w-full bg-secondary rounded-xl p-3 text-sm resize-none h-20 outline-none"
                  />
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <Check className="w-5 h-5" />
                  Registrar
                </button>
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}