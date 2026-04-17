import type { ReactNode } from "react";
import { TimePeriodFilter } from "./TimePeriodFilter";
import { EventLogList } from "./EventLogList";
import type { TimePeriodFilter as TimePeriodFilterState } from "../hooks/useTimePeriodFilter";

interface TrackerLogSectionProps<T extends { id: string }> {
  filter: TimePeriodFilterState;
  items: T[];
  renderItem: (item: T) => ReactNode;
  timeAccessor?: (item: T) => { date?: string; time: string };
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function TrackerLogSection<T extends { id: string }>({
  filter,
  items,
  renderItem,
  timeAccessor,
  onEdit,
  onDelete,
  emptyMessage,
}: TrackerLogSectionProps<T>) {
  return (
    <div className="px-4">
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
        <TimePeriodFilter filter={filter} />
        <p className="text-sm text-muted-foreground mb-3">{filter.title}</p>
        <EventLogList
          items={items}
          renderItem={renderItem}
          timeAccessor={timeAccessor}
          showDate={filter.period !== "today"}
          onEdit={onEdit}
          onDelete={onDelete}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
