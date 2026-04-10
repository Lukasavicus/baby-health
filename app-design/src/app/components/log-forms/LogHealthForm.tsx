import { useState } from "react";
import { Check } from "lucide-react";
import { nowTime } from "../../utils/time";

interface LogHealthFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
}

export function LogHealthForm({ catalogs, onSubmit }: LogHealthFormProps) {
  const healthSubTypes = (catalogs?.healthSubTypes ?? []) as { id: string; label: string }[];

  const [notes, setNotes] = useState("");
  const [healthType, setHealthType] = useState("");
  const [healthName, setHealthName] = useState("");
  const [healthDosage, setHealthDosage] = useState("");

  const handleSubmit = () => {
    onSubmit({
      time: nowTime(),
      notes,
      subType: healthType,
      healthName,
      healthDosage,
    });
  };

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
