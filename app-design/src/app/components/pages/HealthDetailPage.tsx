import { useNavigate } from "react-router";
import { ArrowLeft, Pill, Syringe, ShieldPlus, Heart, Clock } from "lucide-react";
import { useUIBootstrap } from "../../UIBootstrapContext";

export function HealthDetailPage() {
  const navigate = useNavigate();
  const { data } = useUIBootstrap();
  const hd = data?.health_detail ?? {};
  const vitamins = (hd.vitamins ?? []) as {
    name: string;
    dosage: string;
    time: string;
    frequency: string;
    purpose: string;
  }[];
  const medications = (hd.medications ?? []) as {
    name: string;
    dosage: string;
    time: string;
    reason: string;
    status: string;
  }[];
  const history = (hd.history ?? []) as {
    date: string;
    items: { type: string; name: string; dosage: string; time: string }[];
  }[];

  return (
    <div className="pb-6">
      <div className="px-5 pt-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2>Vitaminas & Medicamentos</h2>
      </div>

      {/* Vitamins Section */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-baby-mint/30 flex items-center justify-center">
              <ShieldPlus className="w-4 h-4 text-baby-mint" />
            </div>
            <div>
              <p className="text-sm">Vitaminas</p>
              <p className="text-[10px] text-muted-foreground">Suplementação nutricional e fortalecimento</p>
            </div>
          </div>
          <div className="space-y-3">
            {vitamins.map((v, i) => (
              <div key={i} className="bg-baby-mint/10 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm">{v.name}</p>
                  <span className="text-[10px] bg-baby-mint/30 text-foreground/70 px-2 py-0.5 rounded-full">
                    {v.frequency}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Pill className="w-3 h-3" /> {v.dosage}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {v.time}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{v.purpose}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Medications Section */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-baby-pink/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-baby-pink" />
            </div>
            <div>
              <p className="text-sm">Medicamentos</p>
              <p className="text-[10px] text-muted-foreground">Para quando o bebê está doente ou com desconforto</p>
            </div>
          </div>
          <div className="space-y-3">
            {medications.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhum medicamento ativo</p>
            ) : (
              medications.map((m, i) => (
                <div key={i} className="bg-baby-pink/10 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm">{m.name}</p>
                    <span className="text-[10px] bg-baby-pink/30 text-foreground/70 px-2 py-0.5 rounded-full">
                      {m.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Pill className="w-3 h-3" /> {m.dosage}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Última: {m.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Motivo: {m.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="px-4">
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Histórico</p>
          <div className="space-y-4">
            {history.map((day, di) => (
              <div key={di}>
                <p className="text-xs text-muted-foreground mb-2">{day.date}</p>
                <div className="space-y-2">
                  {day.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-10 shrink-0">{item.time}</span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          item.type === "vitamin" ? "bg-baby-mint/30" : "bg-baby-pink/30"
                        }`}
                      >
                        {item.type === "vitamin" ? (
                          <Pill className="w-3 h-3 text-baby-mint" />
                        ) : (
                          <Syringe className="w-3 h-3 text-baby-pink" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.dosage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
