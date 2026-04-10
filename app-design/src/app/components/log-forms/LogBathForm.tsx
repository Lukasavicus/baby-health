import { useState } from "react";
import { Check, Thermometer } from "lucide-react";
import { nowTime } from "../../utils/time";
import { TimePickerField } from "../TimePickerDialog";

interface LogBathFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
}

export function LogBathForm({ catalogs, onSubmit }: LogBathFormProps) {
  const bathTemps = (catalogs?.bathTemps ?? []) as { id: string; label: string; icon: string }[];
  const bathDurations = (catalogs?.bathDurations ?? []) as number[];

  const [formTime, setFormTime] = useState(nowTime);
  const [notes, setNotes] = useState("");
  const [bathTemp, setBathTemp] = useState("morno");
  const [bathDuration, setBathDuration] = useState(15);

  const handleSubmit = () => {
    onSubmit({
      time: formTime || nowTime(),
      notes,
      subType: bathTemp,
      duration: bathDuration,
    });
  };

  return (
    <>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
        <TimePickerField value={formTime} onChange={setFormTime} />
      </div>

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
