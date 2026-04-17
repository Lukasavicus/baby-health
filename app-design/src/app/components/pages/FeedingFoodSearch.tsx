import { useState, useMemo, useCallback } from "react";
import { Search, Loader2, Plus, Check, FlaskConical } from "lucide-react";
import type { FoodResult } from "./feeding.types";

const CUSTOM_FOODS_KEY = "babyhealth_custom_foods";

interface FeedingFoodSearchProps {
  foodDB: FoodResult[];
  selectedFood: FoodResult | null;
  onFoodChange: (food: FoodResult | null) => void;
  initialQuery?: string;
}

export function FeedingFoodSearch({
  foodDB,
  selectedFood,
  onFoodChange,
  initialQuery = "",
}: FeedingFoodSearchProps) {
  const [foodQuery, setFoodQuery] = useState(initialQuery);
  const [foodResults, setFoodResults] = useState<FoodResult[]>([]);
  const [foodSearching, setFoodSearching] = useState(false);

  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState(0);
  const [customProtein, setCustomProtein] = useState(0);
  const [customCarbs, setCustomCarbs] = useState(0);
  const [customFat, setCustomFat] = useState(0);
  const [customFiber, setCustomFiber] = useState(0);
  const [customUnit, setCustomUnit] = useState<"g" | "portion">("g");
  const [customGramsPerPortion, setCustomGramsPerPortion] = useState(100);

  const customFoods = useMemo<FoodResult[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || "[]");
    } catch { return []; }
  }, [showCustomFood]);

  const allFoodDB = useMemo(() => [...foodDB, ...customFoods], [foodDB, customFoods]);

  const searchFoods = useCallback(
    async (query: string): Promise<FoodResult[]> => {
      await new Promise((r) => setTimeout(r, 600));
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return allFoodDB.filter((f) => f.name.toLowerCase().includes(q));
    },
    [allFoodDB],
  );

  const resetCustomFood = () => {
    setShowCustomFood(false);
    setCustomName("");
    setCustomCal(0);
    setCustomProtein(0);
    setCustomCarbs(0);
    setCustomFat(0);
    setCustomFiber(0);
    setCustomUnit("g");
    setCustomGramsPerPortion(100);
  };

  const saveCustomFood = () => {
    const perHundred = (val: number) =>
      customUnit === "portion" && customGramsPerPortion > 0
        ? Math.round(((val / customGramsPerPortion) * 100) * 10) / 10
        : val;

    const newFood: FoodResult = {
      id: `custom_${Date.now()}`,
      name: customName || foodQuery,
      calories: customUnit === "portion" && customGramsPerPortion > 0
        ? Math.round((customCal / customGramsPerPortion) * 100)
        : customCal,
      protein: perHundred(customProtein),
      carbs: perHundred(customCarbs),
      fat: perHundred(customFat),
      fiber: perHundred(customFiber),
    };
    const existing: FoodResult[] = JSON.parse(localStorage.getItem(CUSTOM_FOODS_KEY) || "[]");
    localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify([...existing, newFood]));
    onFoodChange(newFood);
    setFoodQuery(newFood.name);
    setFoodResults([]);
    resetCustomFood();
  };

  const handleSearch = async (q: string) => {
    setFoodQuery(q);
    if (q.length < 2) { setFoodResults([]); return; }
    setFoodSearching(true);
    const results = await searchFoods(q);
    setFoodResults(results);
    setFoodSearching(false);
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-1.5">
        <FlaskConical className="w-3.5 h-3.5 inline mr-1" />
        Buscar alimento (FatSecret API)
      </p>
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={foodQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Ex: sopa de abóbora, papinha de maçã..."
          className="w-full bg-secondary rounded-xl p-3 pl-9 text-sm outline-none"
        />
        {foodSearching && (
          <Loader2 className="absolute right-3 top-3 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Search results */}
      {foodResults.length > 0 && (
        <div className="mt-2 bg-secondary/50 rounded-xl overflow-hidden">
          {foodResults.map((food) => (
            <button
              key={food.id}
              onClick={() => {
                onFoodChange(food);
                setFoodQuery(food.name);
                setFoodResults([]);
              }}
              className={`w-full text-left p-3 border-b border-border/30 last:border-0 transition-colors ${
                selectedFood?.id === food.id ? "bg-baby-peach/20" : "hover:bg-secondary"
              }`}
            >
              <p className="text-sm">{food.name}</p>
              <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                <span>{food.calories} kcal</span>
                <span>P: {food.protein}g</span>
                <span>C: {food.carbs}g</span>
                <span>G: {food.fat}g</span>
                <span>Fibra: {food.fiber}g</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results — offer custom food */}
      {foodResults.length === 0 && foodQuery.length >= 2 && !foodSearching && !selectedFood && !showCustomFood && (
        <button
          onClick={() => { setShowCustomFood(true); setCustomName(foodQuery); }}
          className="mt-2 w-full text-left p-3 bg-baby-peach/10 border border-baby-peach/20 rounded-xl text-sm transition-colors hover:bg-baby-peach/20"
        >
          <Plus className="w-3.5 h-3.5 inline mr-1.5 text-foreground/60" />
          Criar &quot;{foodQuery}&quot; como alimento personalizado
        </button>
      )}

      {/* Custom food form */}
      {showCustomFood && (
        <div className="mt-3 bg-baby-peach/10 border border-baby-peach/20 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Novo alimento</p>
            <button onClick={resetCustomFood} className="text-xs text-muted-foreground">✕</button>
          </div>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nome do alimento"
            className="w-full bg-secondary rounded-xl p-2.5 text-sm outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setCustomUnit("g")}
              className={`flex-1 py-2 rounded-full text-xs transition-colors ${customUnit === "g" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              Por 100g
            </button>
            <button
              onClick={() => setCustomUnit("portion")}
              className={`flex-1 py-2 rounded-full text-xs transition-colors ${customUnit === "portion" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              Por porção
            </button>
          </div>
          {customUnit === "portion" && (
            <div>
              <p className="text-[10px] text-muted-foreground mb-1">Gramas por porção</p>
              <input
                type="number" inputMode="numeric" min={1} value={customGramsPerPortion}
                onChange={(e) => setCustomGramsPerPortion(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-secondary rounded-xl p-2.5 text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          )}
          <div className="grid grid-cols-5 gap-2">
            {([
              { label: "kcal", val: customCal, set: setCustomCal },
              { label: "Proteína", val: customProtein, set: setCustomProtein },
              { label: "Carbs", val: customCarbs, set: setCustomCarbs },
              { label: "Gordura", val: customFat, set: setCustomFat },
              { label: "Fibra", val: customFiber, set: setCustomFiber },
            ] as const).map((m) => (
              <div key={m.label}>
                <p className="text-[9px] text-muted-foreground mb-1 text-center">{m.label}</p>
                <input
                  type="number" inputMode="decimal" min={0}
                  value={m.val || ""}
                  onChange={(e) => m.set(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-secondary rounded-lg p-1.5 text-xs text-center outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {customUnit === "g" ? "Valores por 100g" : `Valores por porção (${customGramsPerPortion}g) — serão convertidos para 100g`}
          </p>
          <button
            onClick={saveCustomFood}
            disabled={!customName.trim()}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Salvar alimento
          </button>
        </div>
      )}

      {/* Selected food nutrition card */}
      {selectedFood && (
        <div className="mt-3 bg-baby-peach/10 border border-baby-peach/20 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm">{selectedFood.name}</p>
            <button
              onClick={() => { onFoodChange(null); setFoodQuery(""); }}
              className="text-xs text-muted-foreground"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="text-sm text-baby-peach">{selectedFood.calories}</p>
              <p className="text-[9px] text-muted-foreground">kcal</p>
            </div>
            <div>
              <p className="text-sm">{selectedFood.protein}g</p>
              <p className="text-[9px] text-muted-foreground">proteína</p>
            </div>
            <div>
              <p className="text-sm">{selectedFood.carbs}g</p>
              <p className="text-[9px] text-muted-foreground">carbs</p>
            </div>
            <div>
              <p className="text-sm">{selectedFood.fat}g</p>
              <p className="text-[9px] text-muted-foreground">gordura</p>
            </div>
            <div>
              <p className="text-sm">{selectedFood.fiber}g</p>
              <p className="text-[9px] text-muted-foreground">fibra</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            {selectedFood.id.startsWith("custom_") ? "Alimento personalizado" : "Dados via FatSecret API"} · valores por 100g
          </p>
        </div>
      )}
    </div>
  );
}
