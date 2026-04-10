import { useState, useEffect, useMemo } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { getIcon } from "../iconMap";
import { useUIBootstrap } from "../UIBootstrapContext";
import { LogFeedingForm } from "./log-forms/LogFeedingForm";
import { LogHydrationForm } from "./log-forms/LogHydrationForm";
import { LogSleepForm } from "./log-forms/LogSleepForm";
import { LogDiaperForm } from "./log-forms/LogDiaperForm";
import { LogActivityForm } from "./log-forms/LogActivityForm";
import { LogBathForm } from "./log-forms/LogBathForm";
import { LogHealthForm } from "./log-forms/LogHealthForm";

export type LogCategory = "feeding" | "hydration" | "sleep" | "diaper" | "activity" | "bath" | "health" | null;

interface LogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLog: (entry: Record<string, unknown>) => void | Promise<void>;
  initialCategory?: LogCategory;
  initialSubType?: string;
}

export function LogSheet({ open, onOpenChange, onLog, initialCategory = null, initialSubType = "" }: LogSheetProps) {
  const { data } = useUIBootstrap();
  const catalogs = data?.catalogs;

  const logTypes = useMemo(() => {
    const raw = (catalogs?.logTypes ?? []) as {
      id: string;
      label: string;
      icon: string;
      color: string;
    }[];
    return raw.map((t) => ({
      id: t.id as LogCategory,
      label: t.label,
      color: t.color,
      Icon: getIcon(t.icon),
    }));
  }, [catalogs]);

  const [selected, setSelected] = useState<LogCategory>(null);

  useEffect(() => {
    if (open) {
      setSelected(initialCategory);
    } else {
      setSelected(null);
    }
  }, [open, initialCategory]);

  const handleBack = () => {
    if (initialCategory) {
      onOpenChange(false);
    } else {
      setSelected(null);
    }
  };

  const handleSubFormSubmit = async (formData: Record<string, unknown>) => {
    const entry = {
      type: selected,
      timestamp: new Date(),
      caregiver: "Mamãe",
      ...formData,
    };
    await Promise.resolve(onLog(entry));
    onOpenChange(false);
  };

  const getCategoryTitle = () => {
    const cat = logTypes.find((t) => t.id === selected);
    if (!cat) return "Registrar";
    const titles: Record<string, string> = {
      feeding: "Nova Alimentação",
      hydration: "Nova Hidratação",
      sleep: "Novo Sono",
      diaper: "Nova Fralda",
      activity: "Nova Atividade",
      bath: "Novo Banho",
      health: "Novo Registro de Saúde",
    };
    return titles[selected!] || cat.label;
  };

  const renderCategoryForm = () => {
    const props = { catalogs, onSubmit: handleSubFormSubmit };

    switch (selected) {
      case "feeding":
        return <LogFeedingForm {...props} initialSubType={initialSubType} />;
      case "hydration":
        return <LogHydrationForm {...props} />;
      case "sleep":
        return <LogSleepForm {...props} />;
      case "diaper":
        return <LogDiaperForm {...props} />;
      case "activity":
        return <LogActivityForm {...props} initialSubType={initialSubType} />;
      case "bath":
        return <LogBathForm {...props} />;
      case "health":
        return <LogHealthForm {...props} />;
      default:
        return null;
    }
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[85vh] mx-auto max-w-md"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">Registrar</Drawer.Title>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
          <div className="px-5 pb-8 overflow-y-auto max-h-[80vh]">
            {!selected ? (
              <>
                <h2 className="mb-5">Registrar</h2>
                <div className="grid grid-cols-3 gap-3">
                  {logTypes.map((t) => {
                    const IconComp = t.Icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelected(t.id)}
                        className={`${t.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-transform active:scale-95`}
                      >
                        <IconComp className="w-7 h-7 text-foreground/70" />
                        <span className="text-xs text-foreground/80">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <button onClick={handleBack} className="p-1">
                    <X className="w-5 h-5" />
                  </button>
                  <h3>{getCategoryTitle()}</h3>
                  <div className="w-5" />
                </div>

                {renderCategoryForm()}
              </>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
