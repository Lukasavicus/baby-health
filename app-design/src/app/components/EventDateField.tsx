import { formatYmd } from "@/api/eventMappers";

/** Local date (YYYY-MM-DD) for event forms; max = today (no future dates). */
export function EventDateField({
  value,
  onChange,
  label = "Data",
}: {
  value: string;
  onChange: (ymd: string) => void;
  label?: string;
}) {
  const max = formatYmd(new Date());
  return (
    <div className="mb-4">
      <label className="text-xs text-muted-foreground mb-2 block">{label}</label>
      <input
        type="date"
        max={max}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          onChange(v <= max ? v : max);
        }}
        className="w-full bg-secondary rounded-2xl px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

export function todayYmd(): string {
  return formatYmd(new Date());
}

/** Lexicographic compare works for YYYY-MM-DD. */
export function clampYmdNotAfterToday(ymd: string): string {
  const max = todayYmd();
  return ymd > max ? max : ymd;
}
