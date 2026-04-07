import { Sun, Moon } from "lucide-react";

interface AwakeWindowProps {
  lastWake: Date | null;
  isSleeping: boolean;
  onToggleSleep: () => void;
}

export function AwakeWindow({ lastWake, isSleeping, onToggleSleep }: AwakeWindowProps) {
  const now = new Date();
  const diffMs = lastWake ? now.getTime() - lastWake.getTime() : 0;
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  return (
    <div className={`rounded-3xl p-5 border transition-colors ${
      isSleeping
        ? "bg-gradient-to-br from-baby-lavender/30 to-baby-blue/20 border-baby-lavender/20"
        : "bg-gradient-to-br from-baby-mint/30 to-baby-blue/20 border-baby-mint/20"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isSleeping ? "bg-baby-lavender/40" : "bg-baby-mint/40"
          }`}>
            {isSleeping
              ? <Moon className="w-5 h-5 text-foreground/60" />
              : <Sun className="w-5 h-5 text-foreground/60" />
            }
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {isSleeping ? "Dormindo" : "Janela acordado"}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleSleep}
          className={`px-4 py-2 rounded-full text-sm active:scale-95 transition-all ${
            isSleeping
              ? "bg-baby-lavender text-foreground"
              : "bg-baby-mint text-white"
          }`}
        >
          {isSleeping ? "☀️ Acordou" : "🌙 Dormiu"}
        </button>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl">
          {lastWake ? `${hours}h${minutes.toString().padStart(2, "0")}` : "--:--"}
        </span>
        <span className="text-sm text-muted-foreground">
          {isSleeping ? "dormindo" : "desde último sono"}
        </span>
      </div>

      {!isSleeping && lastWake && hours >= 2 && (
        <p className="text-xs text-baby-peach mt-2">
          Atenção: janela acordado acima do usual
        </p>
      )}
    </div>
  );
}
