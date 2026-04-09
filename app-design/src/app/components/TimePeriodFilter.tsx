import type { TimePeriod, TimePeriodFilter as TimePeriodFilterState } from "../hooks/useTimePeriodFilter";

const OPTIONS: { id: TimePeriod; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "week", label: "Semana" },
  { id: "last7days", label: "7 dias" },
  { id: "month", label: "Mês" },
  { id: "custom", label: "Período" },
];

interface TimePeriodFilterProps {
  filter: TimePeriodFilterState;
}

export function TimePeriodFilter({ filter }: TimePeriodFilterProps) {
  return (
    <div className="mb-3">
      <div className="flex flex-wrap gap-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => filter.setPeriod(opt.id)}
            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
              filter.period === opt.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filter.period === "custom" && (
        <div className="flex items-center gap-2 mt-2.5">
          <input
            type="date"
            value={filter.customStart}
            onChange={(e) => filter.setCustomStart(e.target.value)}
            className="flex-1 bg-secondary rounded-xl px-3 py-2 text-xs outline-none"
          />
          <span className="text-xs text-muted-foreground">até</span>
          <input
            type="date"
            value={filter.customEnd}
            onChange={(e) => filter.setCustomEnd(e.target.value)}
            className="flex-1 bg-secondary rounded-xl px-3 py-2 text-xs outline-none"
          />
        </div>
      )}
    </div>
  );
}
