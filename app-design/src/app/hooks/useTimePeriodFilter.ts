import { useState, useMemo, useCallback } from "react";
import { formatYmd } from "@/api/eventMappers";
import type { ApiEvent } from "@/api/client";

export type TimePeriod = "today" | "week" | "last7days" | "month" | "custom";

interface TimePeriodState {
  period: TimePeriod;
  customStart: string;
  customEnd: string;
}

export interface TimePeriodFilter {
  period: TimePeriod;
  setPeriod: (p: TimePeriod) => void;
  customStart: string;
  customEnd: string;
  setCustomStart: (d: string) => void;
  setCustomEnd: (d: string) => void;
  startDate: string;
  endDate: string;
  title: string;
  filterEvents: (events: ApiEvent[]) => ApiEvent[];
}

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sunday
  const result = new Date(d);
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfWeek(d: Date): Date {
  const day = d.getDay();
  const result = new Date(d);
  result.setDate(result.getDate() + (6 - day));
  result.setHours(23, 59, 59, 999);
  return result;
}

export function formatDayMonth(ymd: string): string {
  const [, m, d] = ymd.split("-");
  return `${d}/${m}`;
}

export function dateLabelFromTimestamp(ts: string): string {
  const d = new Date(ts);
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${dd}/${mm}`;
}

function computeRange(state: TimePeriodState): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = formatYmd(now);

  switch (state.period) {
    case "today":
      return { startDate: todayStr, endDate: todayStr };

    case "week": {
      const ws = startOfWeek(now);
      const we = endOfWeek(now);
      return { startDate: formatYmd(ws), endDate: formatYmd(we) };
    }

    case "last7days": {
      const sevenAgo = new Date(now);
      sevenAgo.setDate(sevenAgo.getDate() - 6);
      return { startDate: formatYmd(sevenAgo), endDate: todayStr };
    }

    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: formatYmd(monthStart), endDate: formatYmd(monthEnd) };
    }

    case "custom":
      return {
        startDate: state.customStart || todayStr,
        endDate: state.customEnd || todayStr,
      };
  }
}

function computeTitle(period: TimePeriod, startDate: string, endDate: string): string {
  switch (period) {
    case "today":
      return "Registros de hoje";
    case "week":
      return "Registros da semana";
    case "last7days":
      return "Registros dos últimos 7 dias";
    case "month":
      return "Registros do mês";
    case "custom":
      return `Registros de ${formatDayMonth(startDate)} a ${formatDayMonth(endDate)}`;
  }
}

export function useTimePeriodFilter(): TimePeriodFilter {
  const todayStr = formatYmd(new Date());
  const [state, setState] = useState<TimePeriodState>({
    period: "today",
    customStart: todayStr,
    customEnd: todayStr,
  });

  const setPeriod = useCallback((p: TimePeriod) => {
    setState((prev) => ({ ...prev, period: p }));
  }, []);

  const setCustomStart = useCallback((d: string) => {
    setState((prev) => ({ ...prev, customStart: d }));
  }, []);

  const setCustomEnd = useCallback((d: string) => {
    setState((prev) => ({ ...prev, customEnd: d }));
  }, []);

  const { startDate, endDate } = useMemo(() => computeRange(state), [state]);

  const title = useMemo(
    () => computeTitle(state.period, startDate, endDate),
    [state.period, startDate, endDate],
  );

  const filterEvents = useCallback(
    (events: ApiEvent[]): ApiEvent[] => {
      return events.filter((e) => {
        const ymd = formatYmd(new Date(e.timestamp));
        return ymd >= startDate && ymd <= endDate;
      });
    },
    [startDate, endDate],
  );

  return {
    period: state.period,
    setPeriod,
    customStart: state.customStart,
    customEnd: state.customEnd,
    setCustomStart,
    setCustomEnd,
    startDate,
    endDate,
    title,
    filterEvents,
  };
}
