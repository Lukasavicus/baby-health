import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { nowTime } from "../../utils/time";
import { TimePickerField } from "../TimePickerDialog";

interface LogFeedingFormProps {
  catalogs: any;
  onSubmit: (entry: Record<string, unknown>) => void;
  initialSubType?: string;
}

export function LogFeedingForm({ catalogs, onSubmit, initialSubType }: LogFeedingFormProps) {
  const feedingTypes = (catalogs?.feedingTypes ?? []) as { id: string; label: string }[];
  const formulaBrands = (catalogs?.formulaBrands ?? []) as string[];

  const getInitialState = () => {
    if (initialSubType) {
      const map: Record<string, { type: string; side: string; brand: string }> = {
        breast: { type: "breast", side: "", brand: "" },
        formula: { type: "formula", side: "", brand: "Mamadeira" },
        solids: { type: "solids", side: "", brand: "" },
      };
      return map[initialSubType] ?? { type: initialSubType, side: "", brand: "" };
    }
    return { type: "breast", side: "", brand: "" };
  };

  const init = getInitialState();
  const [formTime, setFormTime] = useState(nowTime);
  const [notes, setNotes] = useState("");
  const [feedType, setFeedType] = useState(init.type);
  const [feedSide, setFeedSide] = useState(init.side);
  const [feedDuration, setFeedDuration] = useState(10);
  const [feedAmount, setFeedAmount] = useState(120);
  const [feedFormula, setFeedFormula] = useState(init.brand);

  const handleSubmit = () => {
    onSubmit({
      time: formTime || nowTime(),
      notes,
      subType: feedType,
      feedSide,
      duration: feedDuration,
      quantity: feedAmount,
      formulaBrand: feedFormula,
    });
  };

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
        <TimePickerField
          value={formTime}
          onChange={setFormTime}
          className="w-full bg-secondary rounded-xl p-3 text-sm outline-none"
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Tipo</p>
        <div className="flex flex-wrap gap-2">
          {feedingTypes.map((ft) => (
            <button
              key={ft.id}
              onClick={() => setFeedType(ft.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                feedType === ft.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {feedType === "breast" && (
        <>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Lado</p>
            <div className="flex gap-2">
              {["Esquerdo", "Direito", "Ambos"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFeedSide(s)}
                  className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${
                    feedSide === s
                      ? "bg-baby-peach text-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Duração (min)</p>
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={() => setFeedDuration(Math.max(1, feedDuration - 1))}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-3xl w-16 text-center">{feedDuration}</span>
              <button
                onClick={() => setFeedDuration(feedDuration + 1)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {feedType === "formula" && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quantidade (ml)</p>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => setFeedAmount(Math.max(0, feedAmount - 30))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl w-20 text-center">{feedAmount}</span>
            <button
              onClick={() => setFeedAmount(feedAmount + 30)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {feedType === "formula" && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Marca da fórmula</p>
          <div className="flex flex-wrap gap-2">
            {formulaBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setFeedFormula(brand)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  feedFormula === brand
                    ? "bg-baby-lavender text-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
          {feedFormula === "Outra" && (
            <input
              type="text"
              placeholder="Nome da fórmula..."
              className="w-full bg-secondary rounded-xl p-3 text-sm outline-none mt-2"
              onChange={(e) => setFeedFormula(e.target.value)}
            />
          )}
        </div>
      )}

      {feedType === "solids" && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quantidade (g)</p>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => setFeedAmount(Math.max(0, feedAmount - 10))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-3xl w-20 text-center">{feedAmount}</span>
            <button
              onClick={() => setFeedAmount(feedAmount + 10)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
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
