import { useState, type ReactNode } from "react";
import { Pencil, Trash2, Check } from "lucide-react";

export interface EventLogListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  timeAccessor?: (item: T) => { date?: string; time: string };
  showDate?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}

export function EventLogList<T extends { id: string }>({
  items,
  renderItem,
  timeAccessor,
  showDate = false,
  onEdit,
  onDelete,
  emptyMessage = "Nenhum registro neste período.",
}: EventLogListProps<T>) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-6">{emptyMessage}</p>
      )}
      {items.map((item) => {
        const timeInfo = timeAccessor?.(item);
        return (
          <div key={item.id} className="flex items-start gap-3 py-2.5 group">
            {timeInfo && (
              <div className="text-xs text-muted-foreground w-12 pt-0.5 shrink-0">
                {showDate && timeInfo.date && (
                  <p className="text-[10px] font-medium">{timeInfo.date}</p>
                )}
                <p>{timeInfo.time}</p>
              </div>
            )}
            <div className="flex-1 min-w-0">{renderItem(item)}</div>
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Pencil className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
                {onDelete && (
                  deleteConfirm === item.id ? (
                    <button
                      onClick={() => { onDelete(item.id); setDeleteConfirm(null); }}
                      className="w-7 h-7 rounded-full bg-destructive/20 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-destructive" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
