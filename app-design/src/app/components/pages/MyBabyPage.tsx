import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Drawer } from "vaul";
import {
  TrendingUp,
  ChevronRight,
  Camera,
  Pencil,
  X,
  Check,
  Calendar,
  Heart,
  Syringe,
  Pill,
  Activity,
  Sparkles,
  FileText,
  Baby,
  Database,
} from "lucide-react";
import { TrackerCard } from "../TrackerCard";
import { getIcon } from "../../iconMap";
import { useUIBootstrap } from "../../UIBootstrapContext";
import { toast } from "sonner";
import { resolveMediaSrc, updateBaby, uploadProfileImage } from "@/api/client";

/** Display string for birth date field (pt-BR). */
function formatBirthDatePtBr(d: Date): string {
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const y = d.getFullYear();
  return `${day}/${mo}/${y}`;
}

/** Parse strict dd/mm/yyyy; year 1900..current calendar year (avoids silent save failures on clock skew). */
function parseBirthDatePtBr(s: string): Date | null {
  const t = s.trim().replace(/\s/g, "");
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = parseInt(m[3], 10);
  const yMax = new Date().getFullYear();
  if (y < 1900 || y > yMax) return null;
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return dt;
}

function calculateAge(birthDate: Date): string {
  const now = new Date();
  const months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());
  if (months < 1) {
    const days = Math.floor(
      (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${days} dias`;
  }
  if (months < 24) return `${months} meses`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} anos e ${rem} meses` : `${years} anos`;
}

export function MyBabyPage() {
  const navigate = useNavigate();
  const { data, babyId, refetch } = useUIBootstrap();
  const growthData = useMemo(() => {
    const raw = data?.profile_extras?.growthCards ?? [];
    return raw.map((g: { label: string; value: string; unit: string; percentile: number; icon: string; color: string }) => ({
      ...g,
      Icon: getIcon(g.icon),
    }));
  }, [data?.profile_extras?.growthCards]);
  const recentMilestones = data?.profile_extras?.recentMilestones ?? [];
  const healthSummary = data?.profile_extras?.healthSummary ?? {
    vaccines: { total: 0, upToDate: true },
    vitamins: { active: 0, names: [] as string[] },
    events: { recent: 0, lastEvent: "" },
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState(() => new Date());
  const [editName, setEditName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [birthDateInput, setBirthDateInput] = useState("");

  const displayPhotoSrc = useMemo(() => resolveMediaSrc(photoUrl), [photoUrl]);

  useEffect(() => {
    const b = data?.baby;
    if (!b) return;
    setBabyName(b.name);
    setEditName(b.name);
    if (b.birth_date) {
      const [y, mo, d] = b.birth_date.split("-").map(Number);
      const dt = new Date(y, mo - 1, d);
      setBirthDate(dt);
      setBirthDateInput(formatBirthDatePtBr(dt));
    } else {
      const dt = new Date();
      setBirthDate(dt);
      setBirthDateInput(formatBirthDatePtBr(dt));
    }
    setPhotoUrl(b.photo_url ?? null);
  }, [data?.baby?.id, data?.baby?.name, data?.baby?.birth_date, data?.baby?.photo_url]);

  useEffect(() => {
    const bt = data?.profile_extras?.bloodType;
    if (bt) setBloodType(bt);
  }, [data?.profile_extras?.bloodType]);

  const age = calculateAge(birthDate);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      e.target.value = "";
      return;
    }
    if (babyId) {
      void (async () => {
        try {
          const { url } = await uploadProfileImage(file);
          setPhotoUrl(url);
        } catch (err) {
          console.error(err);
          toast.error("Não foi possível enviar a foto. Verifique se a API está no ar.");
        }
      })();
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") setPhotoUrl(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const commitBirthDateInput = () => {
    const p = parseBirthDatePtBr(birthDateInput);
    if (p) {
      setBirthDate(p);
      setBirthDateInput(formatBirthDatePtBr(p));
    } else {
      setBirthDateInput(formatBirthDatePtBr(birthDate));
    }
  };

  const handleSaveProfile = () => {
    void (async () => {
      try {
        let parsed = parseBirthDatePtBr(birthDateInput);
        if (!parsed && !birthDateInput.trim()) {
          parsed = Number.isNaN(birthDate.getTime()) ? null : birthDate;
        }
        if (!parsed) {
          toast.error(
            "Data de nascimento inválida. Use dd/mm/aaaa (ex.: 07/09/2025).",
          );
          setBirthDateInput(formatBirthDatePtBr(birthDate));
          return;
        }
        setBirthDate(parsed);
        const resolvedName =
          editName.trim() ||
          babyName.trim() ||
          data?.baby?.name?.trim() ||
          "Bebê";
        if (babyId) {
          const y = parsed.getFullYear();
          const mo = String(parsed.getMonth() + 1).padStart(2, "0");
          const d = String(parsed.getDate()).padStart(2, "0");
          const body: { name: string; birth_date: string; photo_url?: string | null } = {
            name: resolvedName,
            birth_date: `${y}-${mo}-${d}`,
          };
          const serverPhoto = data?.baby?.photo_url ?? null;
          if (photoUrl != null && photoUrl !== serverPhoto) {
            body.photo_url = photoUrl;
          }
          await updateBaby(babyId, body);
          await refetch(babyId);
        } else {
          toast.warning(
            "Sem bebê cadastrado na API (babies.json vazio). O nome/data ficam só na tela até você rodar o seed/setup ou apontar DATA_DIR para uma pasta com dados.",
          );
        }
        setBabyName(resolvedName);
        setEditName(resolvedName);
        setBirthDateInput(formatBirthDatePtBr(parsed));
        setEditOpen(false);
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível salvar o perfil. Tente de novo.");
      }
    })();
  };

  const observedCount = recentMilestones.filter((m) => m.done).length;

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4">
        <h1>Meu Bebê</h1>
      </div>

      {/* --- Profile Card --- */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50 flex items-center gap-4">
          {/* Photo with upload */}
          <div className="relative shrink-0">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-baby-peach/30 ring-2 ring-white shadow-md"
            >
              {displayPhotoSrc ? (
                <img
                  src={displayPhotoSrc}
                  alt={babyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Baby className="w-7 h-7 text-baby-peach" />
              )}
            </button>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-sm pointer-events-none">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate">{babyName}</h2>
              <button
                onClick={() => {
                  setEditName(babyName);
                  const b = data?.baby;
                  if (b?.birth_date) {
                    const [y, mo, d] = b.birth_date.split("-").map(Number);
                    const dt = new Date(y, mo - 1, d);
                    setBirthDate(dt);
                    setBirthDateInput(formatBirthDatePtBr(dt));
                  } else {
                    setBirthDateInput(formatBirthDatePtBr(birthDate));
                  }
                  setEditOpen(true);
                }}
                className="p-1 rounded-full hover:bg-secondary transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{age}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {birthDate.toLocaleDateString("pt-BR")}
              </span>
              {bloodType && (
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {bloodType}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Weekly Summary --- */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-br from-primary/10 to-baby-blue/15 rounded-3xl p-5 border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-sm">Resumo da semana</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl">28</p>
              <p className="text-[10px] text-muted-foreground">refeições</p>
            </div>
            <div className="text-center">
              <p className="text-xl">14h</p>
              <p className="text-[10px] text-muted-foreground">sono/dia</p>
            </div>
            <div className="text-center">
              <p className="text-xl">5x</p>
              <p className="text-[10px] text-muted-foreground">fraldas/dia</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Growth Tile (TrackerCard style) --- */}
      <div className="px-4 mb-4">
        <TrackerCard
          icon={TrendingUp}
          title="Crescimento"
          value=""
          subtitle=""
          color="bg-baby-mint/40"
          onTap={() => navigate("/my-baby/growth")}
        >
          <div className="grid grid-cols-3 gap-3 mt-1">
            {growthData.map((g) => (
              <div
                key={g.label}
                className="bg-background rounded-2xl p-3 text-center border border-border/30"
              >
                <div
                  className={`w-9 h-9 rounded-full ${g.color} flex items-center justify-center mx-auto mb-2`}
                >
                  <g.Icon className="w-4 h-4 text-foreground/50" />
                </div>
                <p className="text-lg">
                  {g.value}
                  <span className="text-[10px] text-muted-foreground ml-0.5">
                    {g.unit}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground">{g.label}</p>
                <div className="mt-1.5 flex items-center justify-center gap-1">
                  <div className="w-10 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${g.percentile}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground">
                    P{g.percentile}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TrackerCard>
      </div>

      {/* --- Milestones Tile (TrackerCard style) --- */}
      <div className="px-4 mb-4">
        <TrackerCard
          icon={Sparkles}
          title="Marcos & Conquistas"
          value={`${observedCount}`}
          subtitle={`de ${recentMilestones.length} recentes`}
          color="bg-baby-lavender/40"
          onTap={() => navigate("/my-baby/milestones")}
        >
          <p className="text-[10px] text-muted-foreground mt-2 mb-3">
            Cada bebê tem seu próprio ritmo. Aqui você registra o que observou,
            sem pressa.
          </p>
          <div className="space-y-2">
            {recentMilestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    m.done ? "bg-baby-lavender/40" : "bg-secondary"
                  }`}
                >
                  {m.done ? (
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/25" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${m.done ? "" : "text-muted-foreground"}`}
                  >
                    {m.title}
                  </p>
                  {m.done && m.observedAge ? (
                    <p className="text-[10px] text-muted-foreground">
                      Observado aos {m.observedAge}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/50">
                      Ainda não observado
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TrackerCard>
      </div>

      {/* --- Health Tile (TrackerCard style) --- */}
      <div className="px-4 mb-4">
        <TrackerCard
          icon={Heart}
          title="Saúde"
          value=""
          subtitle=""
          color="bg-baby-pink/40"
          onTap={() => navigate("/my-baby/health")}
        >
          <div className="space-y-2.5 mt-1">
            {/* Vaccines */}
            <div
              className="flex items-center gap-3 py-2 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/my-baby/health/vaccines");
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-baby-mint/30 flex items-center justify-center shrink-0">
                <Syringe className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Caderneta de Vacinação</p>
                <p className="text-[10px] text-muted-foreground">
                  {healthSummary.vaccines.total} vacinas registradas
                </p>
              </div>
              {healthSummary.vaccines.upToDate && (
                <span className="text-[10px] bg-baby-mint/20 text-primary px-2 py-0.5 rounded-full shrink-0">
                  Em dia
                </span>
              )}
            </div>

            {/* Vitamins */}
            <div
              className="flex items-center gap-3 py-2 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/my-baby/health/vitamins");
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-baby-peach/30 flex items-center justify-center shrink-0">
                <Pill className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Vitaminas & Suplementos</p>
                <p className="text-[10px] text-muted-foreground">
                  {healthSummary.vitamins.active} em uso:{" "}
                  {healthSummary.vitamins.names.join(", ")}
                </p>
              </div>
            </div>

            {/* Health Events */}
            <div
              className="flex items-center gap-3 py-2 cursor-pointer active:scale-[0.99] transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/my-baby/health/events");
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-baby-pink/30 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">Eventos de Saúde</p>
                <p className="text-[10px] text-muted-foreground">
                  Último: {healthSummary.events.lastEvent}
                </p>
              </div>
            </div>
          </div>
        </TrackerCard>
      </div>

      {/* --- My Data Tile (TrackerCard style) --- */}
      <div className="px-4 mb-4">
        <TrackerCard
          icon={Database}
          title="Meus Dados"
          value=""
          subtitle="Exportar ou apagar seus registros"
          color="bg-baby-blue/40"
          onTap={() => navigate("/my-baby/data")}
        />
      </div>

      {/* --- Share with Pediatrician --- */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-primary/10 to-baby-blue/15 rounded-3xl p-5 border border-primary/10 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm">Compartilhar com pediatra</p>
            <p className="text-[10px] text-muted-foreground">
              Gere um resumo completo para a consulta
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* --- Edit Profile Drawer --- */}
      <Drawer.Root open={editOpen} onOpenChange={setEditOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] mx-auto max-w-md"
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">Editar Perfil</Drawer.Title>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setEditOpen(false)} className="p-1">
                  <X className="w-5 h-5" />
                </button>
                <h3>Editar Perfil</h3>
                <div className="w-5" />
              </div>

              {/* Photo with upload */}
              <div className="flex justify-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <div className="relative">
                  <button
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-baby-peach/30 ring-4 ring-secondary shadow-md"
                  >
                    {displayPhotoSrc ? (
                      <img
                        src={displayPhotoSrc}
                        alt={babyName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Baby className="w-10 h-10 text-baby-peach" />
                    )}
                  </button>
                  <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm pointer-events-none">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Nome
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Data de nascimento
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="bday"
                  placeholder="dd/mm/aaaa"
                  value={birthDateInput}
                  onChange={(e) => setBirthDateInput(e.target.value)}
                  onBlur={commitBirthDateInput}
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Use o formato dia/mês/ano (ex.: 07/09/2025).
                </p>
              </div>

              {/* Blood type */}
              <div className="mb-6">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Tipo sanguíneo
                </label>
                <input
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  placeholder="Ex.: O+"
                  className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
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