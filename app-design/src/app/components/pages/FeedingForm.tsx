import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { EventDateField, clampYmdNotAfterToday } from "../EventDateField";
import { TimePickerField } from "../TimePickerDialog";
import { FeedingFoodSearch } from "./FeedingFoodSearch";
import type { FoodResult, FeedingEntry, FeedingFormData, FeedingTypeOption } from "./feeding.types";

interface FeedingFormProps {
  editingEntry: FeedingEntry | null;
  initialDate: string;
  feedingTypes: FeedingTypeOption[];
  formulaBrands: string[];
  foodDB: FoodResult[];
  onSave: (data: FeedingFormData) => void;
}

function nowTime() {
  const n = new Date();
  return `${n.getHours().toString().padStart(2, "0")}:${n.getMinutes().toString().padStart(2, "0")}`;
}

export function FeedingForm({
  editingEntry,
  initialDate,
  feedingTypes,
  formulaBrands,
  foodDB,
  onSave,
}: FeedingFormProps) {
  const [formType, setFormType] = useState<FeedingEntry["type"]>(editingEntry?.type || "breast");
  const [formTime, setFormTime] = useState(editingEntry?.time || nowTime());
  const [formDateYmd, setFormDateYmd] = useState(initialDate);
  const [formSide, setFormSide] = useState(editingEntry?.side || "");
  const [formDuration, setFormDuration] = useState(parseInt(editingEntry?.duration || "10"));
  const [formAmount, setFormAmount] = useState(parseInt(editingEntry?.amount || "120"));
  const [formNotes, setFormNotes] = useState(editingEntry?.notes || "");
  const [formFood, setFormFood] = useState<FoodResult | null>(editingEntry?.food || null);
  const [formFormula, setFormFormula] = useState(
    editingEntry ? (editingEntry.formulaBrand || "") : "Mamadeira",
  );

  const handleSubmit = () => {
    onSave({
      type: formType,
      time: formTime,
      dateYmd: clampYmdNotAfterToday(formDateYmd),
      side: formSide,
      duration: formDuration,
      amount: formAmount,
      notes: formNotes,
      food: formFood,
      formula: formFormula,
    });
  };

  return (
    <>
      <EventDateField value={formDateYmd} onChange={setFormDateYmd} />

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1.5">Horário</p>
        <TimePickerField
          value={formTime}
          onChange={(time) => setFormTime(time)}
          className="w-full bg-secondary rounded-xl p-3 text-sm outline-none"
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">Tipo</p>
        <div className="flex flex-wrap gap-2">
          {feedingTypes.map((ft) => (
            <button
              key={ft.id}
              onClick={() => setFormType(ft.id)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                formType === ft.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {formType === "breast" && (
        <>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Lado</p>
            <div className="flex gap-2">
              {["Esquerdo", "Direito", "Ambos"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFormSide(s)}
                  className={`flex-1 py-2.5 rounded-full text-sm transition-colors ${
                    formSide === s
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
                onClick={() => setFormDuration(Math.max(1, formDuration - 1))}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={formDuration}
                onChange={(e) => setFormDuration(Math.max(1, Number(e.target.value) || 1))}
                className="text-3xl w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => setFormDuration(formDuration + 1)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {formType === "formula" && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quantidade (ml)</p>
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => setFormAmount(Math.max(0, formAmount - 30))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={formAmount}
              onChange={(e) => setFormAmount(Math.max(0, Number(e.target.value) || 0))}
              className="text-3xl w-20 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() => setFormAmount(formAmount + 30)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {formType === "formula" && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Marca da fórmula</p>
          <div className="flex flex-wrap gap-2">
            {formulaBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => setFormFormula(brand)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  formFormula === brand
                    ? "bg-baby-lavender text-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
          {formFormula === "Outra" && (
            <input
              type="text"
              placeholder="Nome da fórmula..."
              className="w-full bg-secondary rounded-xl p-3 text-sm outline-none mt-2"
              onChange={(e) => setFormFormula(e.target.value)}
            />
          )}
        </div>
      )}

      {formType === "solids" && (
        <>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Quantidade (g)</p>
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={() => setFormAmount(Math.max(0, formAmount - 10))}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={formAmount}
                onChange={(e) => setFormAmount(Math.max(0, Number(e.target.value) || 0))}
                className="text-3xl w-20 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={() => setFormAmount(formAmount + 10)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FeedingFoodSearch
            foodDB={foodDB}
            selectedFood={formFood}
            onFoodChange={setFormFood}
            initialQuery={editingEntry?.food?.name || ""}
          />
        </>
      )}

      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-2">Notas</p>
        <textarea
          value={formNotes}
          onChange={(e) => setFormNotes(e.target.value)}
          placeholder="Adicionar nota..."
          className="w-full bg-secondary rounded-xl p-3 text-sm resize-none h-20 outline-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-primary text-primary-foreground py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Check className="w-5 h-5" />
        {editingEntry ? "Salvar alterações" : "Registrar"}
      </button>
    </>
  );
}
