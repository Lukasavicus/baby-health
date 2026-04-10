import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";

interface TrackerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function TrackerDrawer({ open, onOpenChange, title, children }: TrackerDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[90vh] mx-auto max-w-md"
          aria-describedby={undefined}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
          <div className="px-5 pb-8 overflow-y-auto max-h-[85vh]">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => onOpenChange(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
              <h3>{title}</h3>
              <div className="w-5" />
            </div>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
