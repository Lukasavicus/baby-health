import { useState, useMemo } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { nowTime } from "../../utils/time";
import { getIcon } from "../../iconMap";

interface LogActivityFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
  initialSubType?: string;
}

export function LogActivityForm({ catalogs, onSubmit, initialSubType }: LogActivityFormProps) {
  const activityTypes = useMemo(
    () =>
      ((catalogs?.activityTypes ?? []) as { id: string; label: string; icon: string }[]).map((t) => ({
        ...t,
        Icon: getIcon(t.icon),
      })),
    [catalogs],
  );

  const [notes, setNotes] = useState("");
  const [actType, setActType] = useState(initialSubType || "");
  const [actDuration, setActDuration] = useState(15);

  const handleSubmit = () => {
    onSubmit({
      time: nowTime(),
      notes,
      subType: actType,
      duration: actDuration,
    });
  };

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
        onClick={handleSubmit}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Check className="w-5 h-5" />
        Registrar
      </button>
    </>
  );
}
