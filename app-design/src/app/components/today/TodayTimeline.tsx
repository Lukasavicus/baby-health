import { Plus } from "lucide-react";
import { Timeline, type TimelineEntry } from "../Timeline";
import { LogSheet, type LogCategory } from "../LogSheet";

export interface TodayTimelineProps {
  entries: TimelineEntry[];
  logOpen: boolean;
  logCategory: LogCategory;
  logSubType: string;
  onOpenLog: (category?: LogCategory, subType?: string) => void;
  onLogOpenChange: (open: boolean) => void;
  onLog: (entry: Record<string, unknown>) => Promise<void> | void;
  onEditEntry: (index: number) => void;
  onDeleteEntry: (index: number) => void;
}

export function TodayTimeline({
  entries,
  logOpen,
  logCategory,
  logSubType,
  onOpenLog,
  onLogOpenChange,
  onLog,
  onEditEntry,
  onDeleteEntry,
}: TodayTimelineProps) {
  return (
    <>
      {/* Timeline */}
      <div className="px-4">
        <Timeline
          entries={entries}
          onEdit={onEditEntry}
          onDelete={onDeleteEntry}
        />
      </div>

      {/* FAB */}
      <button
        onClick={() => onOpenLog(undefined)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-30 active:scale-90 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      <LogSheet
        open={logOpen}
        onOpenChange={onLogOpenChange}
        onLog={onLog}
        initialCategory={logCategory}
        initialSubType={logSubType}
      />
    </>
  );
}
