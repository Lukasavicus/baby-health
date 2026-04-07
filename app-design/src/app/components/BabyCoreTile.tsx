import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useUIBootstrap } from "../UIBootstrapContext";

interface Pillar {
  label: string;
  shortLabel: string;
  score: number;
  color: string;
  status: string;
  trend: "up" | "down" | "stable";
  detail: string;
}

function getCompositeScore(p: Pillar[]) {
  return Math.round(p.reduce((a, b) => a + b.score, 0) / p.length);
}

function getStatusLabel(score: number) {
  if (score >= 85) return { text: "Indo muito bem", emoji: "✨" };
  if (score >= 70) return { text: "No caminho certo", emoji: "💚" };
  if (score >= 50) return { text: "Atenção em algumas áreas", emoji: "👀" };
  return { text: "Dados insuficientes", emoji: "📝" };
}

/* ── Petal / Flower Core Graphic ── */
function PetalCore({ pillars: p, size = 130 }: { pillars: Pillar[]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;

  // 4 petals arranged N/E/S/W
  const petalAngles = [-90, 0, 90, 180]; // top, right, bottom, left

  function petalPath(angle: number, fraction: number) {
    const r = maxR * Math.max(fraction, 0.15);
    const rad = (angle * Math.PI) / 180;
    const tipX = cx + Math.cos(rad) * r;
    const tipY = cy + Math.sin(rad) * r;

    // control points for the bulge
    const spread = r * 0.55;
    const perpRad1 = rad + Math.PI / 2;
    const perpRad2 = rad - Math.PI / 2;

    const cp1x = cx + Math.cos(rad) * r * 0.45 + Math.cos(perpRad1) * spread;
    const cp1y = cy + Math.sin(rad) * r * 0.45 + Math.sin(perpRad1) * spread;
    const cp2x = cx + Math.cos(rad) * r * 0.45 + Math.cos(perpRad2) * spread;
    const cp2y = cy + Math.sin(rad) * r * 0.45 + Math.sin(perpRad2) * spread;

    return `M ${cx} ${cy} Q ${cp1x} ${cp1y} ${tipX} ${tipY} Q ${cp2x} ${cp2y} ${cx} ${cy} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background petals (full) */}
      {p.map((pillar, i) => (
        <path
          key={`bg-${i}`}
          d={petalPath(petalAngles[i], 1)}
          fill={pillar.color}
          opacity={0.15}
        />
      ))}
      {/* Filled petals (by score) */}
      {p.map((pillar, i) => (
        <path
          key={`fg-${i}`}
          d={petalPath(petalAngles[i], pillar.score / 100)}
          fill={pillar.color}
          opacity={0.7}
          style={{ transition: "d 0.6s ease" }}
        />
      ))}
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={size * 0.1} fill="white" />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="14">
        🌱
      </text>
    </svg>
  );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-baby-mint" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-baby-pink" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
}

export function BabyCoreTile() {
  const { data } = useUIBootstrap();
  const pillars = (data?.baby_core?.pillars ?? []) as Pillar[];
  const babyName = data?.baby?.name ?? "Bebê";
  const [expanded, setExpanded] = useState(false);
  const composite =
    pillars.length > 0 ? getCompositeScore(pillars) : 0;
  const status = getStatusLabel(pillars.length ? composite : 0);

  return (
    <div
      className="bg-card rounded-3xl shadow-sm border border-border/50 overflow-hidden cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground tracking-wide uppercase">Baby Core</p>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{status.emoji}</span>
              <p className="text-sm">{status.text}</p>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Bem-estar geral do dia — baseado na rotina de {babyName}.
            </p>

            <div className="space-y-1.5">
              {pillars.map((p) => (
                <div key={p.label} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-[11px] text-muted-foreground w-16 truncate">
                    {p.shortLabel}
                  </span>
                  <span className="text-[11px]">{p.score}%</span>
                  <TrendIcon trend={p.trend} />
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            {pillars.length > 0 ? (
              <PetalCore pillars={pillars} size={130} />
            ) : (
              <div className="w-[130px] h-[130px] rounded-full bg-secondary/50" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border/30">
              <p className="text-xs text-muted-foreground mb-3 mt-3">
                Pontuação composta: <span className="text-foreground">{composite}/100</span> — indicador de rotina diária, não diagnóstico médico.
              </p>

              <div className="space-y-3">
                {pillars.map((p) => (
                  <div
                    key={p.label}
                    className="bg-secondary/50 rounded-2xl p-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-sm">{p.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">{p.status}</span>
                        <TrendIcon trend={p.trend} />
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${p.score}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{p.detail}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-4">
                Indicador de bem-estar diário · Não substitui orientação médica
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
