import { useState, useMemo } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { nowTime } from "../../utils/time";
import { TimePickerField } from "../TimePickerDialog";
import { getIcon } from "../../iconMap";

interface LogHydrationFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
}

export function LogHydrationForm({ catalogs, onSubmit }: LogHydrationFormProps) {
  const drinkTypes = useMemo(
    () =>
      ((catalogs?.drinkTypes ?? []) as { id: string; label: string; icon: string }[]).map((t) => ({
        ...t,
        Icon: getIcon(t.icon),
      })),
    [catalogs],
  );
  const quickAmounts = (catalogs?.quickAmounts ?? []) as number[];

  const [formTime, setFormTime] = useState(nowTime);
  const [notes, setNotes] = useState("");
  const [hydType, setHydType] = useState("water");
  const [hydAmount, setHydAmount] = useState(60);

  const handleSubmit = () => {
    onSubmit({
      time: formTime || nowTime(),
      notes,
      subType: hydType,
      quantity: hydAmount,
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
