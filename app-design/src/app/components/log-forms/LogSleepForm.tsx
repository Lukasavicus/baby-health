import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { nowTime, calcDurationMin, formatDuration } from "../../utils/time";
import { TimePickerField } from "../TimePickerDialog";
import { getIcon } from "../../iconMap";

interface LogSleepFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
}

export function LogSleepForm({ catalogs, onSubmit }: LogSleepFormProps) {
  const sleepTypes = useMemo(
    () =>
      ((catalogs?.sleepTypes ?? []) as { id: "night" | "nap"; label: string; icon: string }[]).map((t) => ({
        ...t,
        Icon: getIcon(t.icon),
      })),
    [catalogs],
  );
  const sleepLocations = (catalogs?.sleepLocations ?? []) as string[];

  const [notes, setNotes] = useState("");
  const [sleepType, setSleepType] = useState("nap");
  const [sleepStart, setSleepStart] = useState(nowTime);
  const [sleepEnd, setSleepEnd] = useState("");
  const [sleepLocation, setSleepLocation] = useState("");

  const handleSubmit = () => {
    onSubmit({
      time: nowTime(),
      notes,
      subType: sleepType,
      sleepStart,
      sleepEnd,
      sleepLocation,
    });
  };

  return (
    <>
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

      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1.5">Início</p>
        <TimePickerField value={sleepStart} onChange={setSleepStart} />
      </div>

      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1.5">Fim</p>
        <TimePickerField value={sleepEnd} onChange={setSleepEnd} />
      </div>

      {sleepStart && sleepEnd && (
        <div className="mb-5 bg-secondary/50 rounded-2xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Duração</p>
          <p className="text-lg">{formatDuration(calcDurationMin(sleepStart, sleepEnd))}</p>
        </div>
      )}

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
