import { useMemo } from "react";

/** How the Y axis is scaled and labelled (drives tick generation). */
export type WeekBarChartValueScale = "count" | "hours" | "ml" | "minutes";

export interface WeekBarChartProps {
  title: string;
  data: { day: string; value: number }[];
  color?: string;
  /** Overrides default formatting for axis labels and bar top labels. */
  formatValue?: (v: number) => string;
  /** When true, shows Y axis, grid lines and bar value labels (default: true). */
  showGridLines?: boolean;
  /**
   * Semantic scale for automatic Y ticks and default formatValue.
   * - count: integers (meals, baths, diapers)
   * - hours: sleep totals (decimals ok)
   * - ml: hydration totals
   * - minutes: activity minutes
   */
  valueScale?: WeekBarChartValueScale;
}

function defaultFormatForScale(scale: WeekBarChartValueScale): (v: number) => string {
  switch (scale) {
    case "hours":
      return (v) => v.toFixed(1);
    case "ml":
      return (v) => `${Math.round(v)}`;
    case "minutes":
      return (v) => `${Math.round(v)}`;
    case "count":
    default:
      return (v) => String(Math.round(v));
  }
}

/** Build axis top and tick positions (excluding 0). */
function computeAxisTicks(maxValue: number, scale: WeekBarChartValueScale): { axisMax: number; ticks: number[] } {
  const m = Math.max(maxValue, 0);
  if (m === 0) {
    return { axisMax: 1, ticks: [] };
  }

  switch (scale) {
    case "hours": {
      let axisMax = m <= 1 ? Math.ceil(m * 2) / 2 : m <= 4 ? Math.ceil(m) : Math.ceil(m / 2) * 2;
      if (axisMax < m) axisMax = Math.ceil(m * 10) / 10;
      axisMax = Math.max(axisMax, 0.5);
      const step =
        axisMax <= 2 ? 0.5 : axisMax <= 8 ? 1 : axisMax <= 16 ? 2 : Math.max(2, Math.ceil(axisMax / 4));
      const ticks: number[] = [];
      for (let v = step; v < axisMax - 1e-9; v += step) {
        ticks.push(Math.round(v * 100) / 100);
      }
      if (ticks.length === 0 || ticks[ticks.length - 1] < axisMax - 1e-9) {
        ticks.push(Math.round(axisMax * 100) / 100);
      }
      return { axisMax, ticks };
    }
    case "ml": {
      let axisMax = Math.max(Math.ceil(m / 50) * 50, 50);
      if (axisMax > 2000) axisMax = Math.ceil(m / 200) * 200;
      const step = axisMax <= 200 ? 50 : axisMax <= 500 ? 100 : axisMax <= 1000 ? 200 : 500;
      const ticks: number[] = [];
      for (let v = step; v < axisMax; v += step) ticks.push(v);
      if (!ticks.includes(axisMax)) ticks.push(axisMax);
      return { axisMax, ticks: [...new Set(ticks)].sort((a, b) => a - b) };
    }
    case "minutes": {
      const axisMax = Math.max(Math.ceil(m / 15) * 15, 15);
      const step = axisMax <= 90 ? 15 : axisMax <= 180 ? 30 : axisMax <= 360 ? 60 : 120;
      const ticks: number[] = [];
      for (let v = step; v < axisMax; v += step) ticks.push(v);
      if (!ticks.includes(axisMax)) ticks.push(axisMax);
      return { axisMax, ticks };
    }
    case "count":
    default: {
      const axisMax = Math.max(Math.ceil(m), 1);
      const step = axisMax <= 4 ? 1 : axisMax <= 10 ? 2 : Math.ceil(axisMax / 4);
      const ticks: number[] = [];
      for (let v = step; v < axisMax; v += step) ticks.push(v);
      if (!ticks.length || ticks[ticks.length - 1] !== axisMax) ticks.push(axisMax);
      return { axisMax, ticks };
    }
  }
}

export function WeekBarChart({
  title,
  data,
  color = "bg-baby-peach/60",
  formatValue: formatValueProp,
  showGridLines = true,
  valueScale = "count",
}: WeekBarChartProps) {
  const formatValue = formatValueProp ?? defaultFormatForScale(valueScale);

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 0), [data]);

  const { axisMax, ticks: gridLines } = useMemo(
    () => computeAxisTicks(maxValue, valueScale),
    [maxValue, valueScale],
  );

  const adjustedMax = showGridLines ? Math.max(axisMax, maxValue > 0 ? maxValue : 1) : Math.max(maxValue, 1);

  if (showGridLines) {
    return (
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
        <p className="text-sm text-muted-foreground mb-4">{title}</p>
        <div className="flex">
          <div className="flex flex-col justify-between h-40 pr-2 pb-5">
            {[...gridLines].reverse().map((val) => (
              <span key={val} className="text-[9px] text-muted-foreground leading-none">
                {formatValue(val)}
              </span>
            ))}
            <span className="text-[9px] text-muted-foreground leading-none">0</span>
          </div>
          <div className="flex-1 relative h-40">
            <div className="absolute inset-0 bottom-5 rounded-lg bg-secondary/20">
              {gridLines.map((val) => (
                <div
                  key={val}
                  className="absolute w-full border-t border-dashed border-border/40"
                  style={{ bottom: `${(val / adjustedMax) * 100}%` }}
                />
              ))}
            </div>
            <div className="relative flex items-end justify-between gap-2 h-full pb-5">
              {data.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  {d.value > 0 && (
                    <span className="text-[10px] text-foreground/60">{formatValue(d.value)}</span>
                  )}
                  <div
                    className={`w-full rounded-lg ${color} transition-all`}
                    style={{
                      height: `${(d.value / adjustedMax) * 100}%`,
                      minHeight: d.value > 0 ? 8 : 4,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between absolute bottom-0 w-full">
              {data.map((d) => (
                <span key={`label-${d.day}`} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const simpleMax = Math.max(maxValue, 1);
  return (
    <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
      <p className="text-sm text-muted-foreground mb-4">{title}</p>
      <div className="flex items-end justify-between gap-2 h-24">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-lg ${color} transition-all`}
              style={{ height: `${(d.value / simpleMax) * 100}%`, minHeight: 8 }}
            />
            <span className="text-[10px] text-muted-foreground">{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
