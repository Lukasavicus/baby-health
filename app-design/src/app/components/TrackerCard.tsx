import { ChevronRight } from "lucide-react";

interface TrackerCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  progress?: number;
  onAction?: () => void;
  onTap?: () => void;
  actionLabel?: string;
  children?: React.ReactNode;
}

export function TrackerCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
  progress,
  onAction,
  onTap,
  actionLabel = "Registrar",
  children,
}: TrackerCardProps) {
  return (
    <div
      className={`bg-card rounded-3xl p-5 shadow-sm border border-border/50 ${onTap ? "cursor-pointer active:scale-[0.99] transition-transform" : ""}`}
      onClick={onTap}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-foreground/60" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAction && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction(); }}
              className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm active:scale-95 transition-transform"
            >
              {actionLabel}
            </button>
          )}
          {onTap && (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-3xl">{value}</span>
        <span className="text-sm text-muted-foreground">{subtitle}</span>
      </div>

      {progress !== undefined && (
        <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}

      {children}
    </div>
  );
}
