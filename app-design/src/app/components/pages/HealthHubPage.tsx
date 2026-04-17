import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Syringe,
  Pill,
  Activity,
  ChevronRight,
  Heart,
  FileText,
} from "lucide-react";
import { useUIBootstrap } from "../../UIBootstrapContext";

export function HealthHubPage() {
  const navigate = useNavigate();
  const { data } = useUIBootstrap();
  const hs = data?.profile_extras?.healthSummary;
  const vaccineListLen = data?.vaccines?.vaccines?.length ?? 0;
  const eventListLen = data?.health_events?.events?.length ?? 0;

  const sections = useMemo(
    () => [
      {
        id: "vaccines",
        label: "Caderneta de Vacinacao",
        sublabel: `${vaccineListLen} vacinas registradas - ${hs?.vaccines?.upToDate ? "Em dia" : "Verificar"}`,
        icon: Syringe,
        color: "bg-baby-mint/30",
        iconColor: "text-primary",
        badge: hs?.vaccines?.upToDate ? "Em dia" : undefined,
        badgeColor: "bg-baby-mint/20 text-primary",
        path: "/my-baby/health/vaccines",
      },
      {
        id: "vitamins",
        label: "Vitaminas & Suplementos",
        sublabel: `${hs?.vitamins?.active ?? 0} em uso: ${(hs?.vitamins?.names ?? []).join(", ") || "—"}`,
        icon: Pill,
        color: "bg-baby-peach/30",
        iconColor: "text-amber-500",
        path: "/my-baby/health/vitamins",
      },
      {
        id: "events",
        label: "Eventos de Saude",
        sublabel: `${eventListLen} registros - Ultimo: ${hs?.events?.lastEvent ?? "—"}`,
        icon: Activity,
        color: "bg-baby-pink/30",
        iconColor: "text-rose-400",
        path: "/my-baby/health/events",
      },
    ],
    [hs, vaccineListLen, eventListLen],
  );

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/my-baby")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2>Saude</h2>
      </div>

      {/* Overview card */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-baby-pink/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm">Resumo de saude</p>
              <p className="text-[10px] text-muted-foreground">
                Tudo organizado para a proxima consulta
              </p>
            </div>
          </div>
            <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-baby-mint/10 rounded-2xl py-3">
              <p className="text-lg text-primary">{vaccineListLen}</p>
              <p className="text-[10px] text-muted-foreground">vacinas</p>
            </div>
            <div className="text-center bg-baby-peach/10 rounded-2xl py-3">
              <p className="text-lg text-amber-500">{hs?.vitamins?.active ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">suplementos</p>
            </div>
            <div className="text-center bg-baby-pink/10 rounded-2xl py-3">
              <p className="text-lg text-rose-400">{eventListLen}</p>
              <p className="text-[10px] text-muted-foreground">eventos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 space-y-3 mb-6">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => navigate(s.path)}
              className="w-full bg-card rounded-2xl p-4 shadow-sm border border-border/50 flex items-center gap-3.5 active:scale-[0.98] transition-transform"
            >
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.sublabel}</p>
              </div>
              {s.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${s.badgeColor}`}>
                  {s.badge}
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Share */}
      <div className="px-4">
        <button className="w-full bg-gradient-to-r from-primary/10 to-baby-blue/15 rounded-3xl p-5 border border-primary/10 flex items-center gap-4 active:scale-[0.98] transition-transform">
          <div className="w-11 h-11 rounded-2xl bg-white/60 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm">Gerar resumo para consulta</p>
            <p className="text-[10px] text-muted-foreground">
              Crie um relatorio completo para o pediatra
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
