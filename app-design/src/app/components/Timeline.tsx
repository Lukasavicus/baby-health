import { useState, useRef } from "react";
import {
  Milk, Droplets, Moon, Activity, ChevronDown, ChevronUp, Bath, Pill,
  ClockArrowUp, Pencil, Trash2,
} from "lucide-react";
import { DiaperIcon } from "./DiaperIcon";
import { motion, AnimatePresence } from "motion/react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  feeding: Milk,
  hydration: Droplets,
  sleep: Moon,
  diaper: DiaperIcon,
  activity: Activity,
  bath: Bath,
  health: Pill,
};

const colorMap: Record<string, string> = {
  feeding: "bg-baby-peach",
  hydration: "bg-baby-blue",
  sleep: "bg-baby-lavender",
  diaper: "bg-baby-yellow",
  activity: "bg-baby-mint",
  bath: "bg-baby-blue",
  health: "bg-baby-pink",
};

const labelMap: Record<string, string> = {
  feeding: "Alimentação",
  hydration: "Hidratação",
  sleep: "Sono",
  diaper: "Fralda",
  activity: "Atividade",
  bath: "Banho",
  health: "Saúde",
};

export interface TimelineEntry {
  id?: string;
  type: string;
  subType?: string;
  quantity?: number;
  notes?: string;
  time: string;
  caregiver: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
}

// Individual swipeable row
function SwipeableRow({
  children,
  onEdit,
  onDelete,
}: {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const startXRef = useRef(0);
  const currentXRef = useRef(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const threshold = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = offset;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startXRef.current;
    const newOffset = Math.min(0, Math.max(-140, currentXRef.current + dx));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (offset < -threshold) {
      setOffset(-140);
    } else {
      setOffset(0);
    }
  };

  // Mouse drag support
  const draggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    currentXRef.current = offset;
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const newOffset = Math.min(0, Math.max(-140, currentXRef.current + dx));
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (offset < -threshold) {
      setOffset(-140);
    } else {
      setOffset(0);
    }
  };

  const handleMouseLeave = () => {
    if (draggingRef.current) {
      draggingRef.current = false;
      if (offset < -threshold) {
        setOffset(-140);
      } else {
        setOffset(0);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Actions behind */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch">
        <button
          onClick={() => { onEdit?.(); setOffset(0); }}
          className="w-[70px] bg-baby-blue flex items-center justify-center"
        >
          <Pencil className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => { onDelete?.(); setOffset(0); }}
          className="w-[70px] bg-destructive flex items-center justify-center"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Foreground content */}
      <div
        ref={rowRef}
        className="relative bg-card transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
}

export function Timeline({ entries, onEdit, onDelete }: TimelineProps) {
  const [expanded, setExpanded] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-baby-mint/30 to-baby-lavender/30 flex items-center justify-center">
            <ClockArrowUp className="w-5 h-5 text-foreground/60" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Linha do tempo</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">Nenhum registro hoje.</p>
            <p className="text-xs mt-1">Toque em + para começar!</p>
          </div>
        </div>
      </div>
    );
  }

  const visibleEntries = expanded ? entries : entries.slice(0, 3);

  return (
    <div className="bg-card rounded-3xl p-5 shadow-sm border border-border/50">
      {/* Header */}
      <button
        className="flex items-center justify-between w-full"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-baby-mint/30 to-baby-lavender/30 flex items-center justify-center">
            <ClockArrowUp className="w-5 h-5 text-foreground/60" />
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Linha do tempo</p>
            <p className="text-[10px] text-muted-foreground/60">{entries.length} registros hoje</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Separator */}
      <div className="mt-3 pt-3 border-t border-border/30">
        {/* Entries */}
        <div className="space-y-1">
          {visibleEntries.map((entry, i) => {
            const Icon = iconMap[entry.type] || Activity;
            const originalIndex = expanded ? i : i; // index within entries array
            // Find actual index in full entries array for non-expanded
            const realIndex = expanded ? i : entries.indexOf(entry);

            return (
              <SwipeableRow
                key={entry.id ?? `${entry.time}-${entry.type}-${realIndex}`}
                onEdit={() => onEdit?.(realIndex)}
                onDelete={() => onDelete?.(realIndex)}
              >
                <div className="flex items-start gap-3 py-3 px-1 select-none">
                  <div className={`w-9 h-9 rounded-full ${colorMap[entry.type] || "bg-muted"} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4 text-foreground/60" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{labelMap[entry.type] || entry.type}</p>
                      <span className="text-xs text-muted-foreground">{entry.time}</span>
                    </div>
                    {entry.subType && (
                      <p className="text-xs text-muted-foreground capitalize">{entry.subType}</p>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.notes}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 shrink-0">{entry.caregiver}</span>
                </div>
              </SwipeableRow>
            );
          })}
        </div>

        <AnimatePresence>
          {!expanded && entries.length > 3 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setExpanded(true)}
              className="text-xs text-primary mt-3 w-full text-center py-1"
            >
              Ver todos ({entries.length})
            </motion.button>
          )}
        </AnimatePresence>

        {expanded && entries.length > 3 && (
          <button
            onClick={() => setExpanded(false)}
            className="text-xs text-primary mt-3 w-full text-center py-1"
          >
            Mostrar menos
          </button>
        )}
      </div>
    </div>
  );
}