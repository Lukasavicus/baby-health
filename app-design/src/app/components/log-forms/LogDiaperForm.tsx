import { useState } from "react";
import { Check } from "lucide-react";
import { nowTime } from "../../utils/time";
import { TimePickerField } from "../TimePickerDialog";

type VolumeLevel = 1 | 2 | 3 | 4;

interface LogDiaperFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
}

export function LogDiaperForm({ catalogs, onSubmit }: LogDiaperFormProps) {
  const diaperTypes = (catalogs?.diaperTypes ?? []) as { id: string; label: string }[];
  const vlRaw = (catalogs?.volumeLabelsLogSheet ?? catalogs?.volumeLabels ?? {}) as Record<string, string>;
  const volumeLabels: Record<VolumeLevel, string> = {
    1: vlRaw["1"] ?? "Pouco",
    2: vlRaw["2"] ?? "Normal",
    3: vlRaw["3"] ?? "Bastante",
    4: vlRaw["4"] ?? "Muito",
  };

  const [formTime, setFormTime] = useState(nowTime);
  const [notes, setNotes] = useState("");
  const [diaperType, setDiaperType] = useState("pee");
  const [peeVol, setPeeVol] = useState<VolumeLevel>(2);
  const [pooVol, setPooVol] = useState<VolumeLevel>(2);

  const handleSubmit = () => {
    onSubmit({
      time: formTime || nowTime(),
      notes,
      subType: diaperType,
      peeVolume: peeVol,
      pooVolume: pooVol,
    });
  };

  return (
    <>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
        <TimePickerField value={formTime} onChange={setFormTime} />
      </div>

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
