import { useState, useCallback, useEffect } from "react";
import { Clock, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TimePickerFieldProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  className?: string;
}

type Mode = "hour" | "minute";

const HOURS_INNER = Array.from({ length: 12 }, (_, i) => i); // 0-11
const HOURS_OUTER = Array.from({ length: 12 }, (_, i) => i + 12); // 12-23
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function ClockDialog({
  open,
  onClose,
  initialValue,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  initialValue: string;
  onConfirm: (v: string) => void;
}) {
  const [h, mm] = initialValue.split(":").map(Number);
  const [hour, setHour] = useState(h || 0);
  const [minute, setMinute] = useState(mm || 0);
  const [mode, setMode] = useState<Mode>("hour");
  const [inputMode, setInputMode] = useState(false);
  const [inputHour, setInputHour] = useState("");
  const [inputMinute, setInputMinute] = useState("");

  useEffect(() => {
    if (open) {
      const [hh, mn] = initialValue.split(":").map(Number);
      setHour(hh || 0);
      setMinute(mn || 0);
      setMode("hour");
      setInputMode(false);
    }
  }, [open, initialValue]);

  const handleConfirm = () => {
    if (inputMode) {
      const ih = Math.min(23, Math.max(0, parseInt(inputHour) || 0));
      const im = Math.min(59, Math.max(0, parseInt(inputMinute) || 0));
      onConfirm(`${ih.toString().padStart(2, "0")}:${im.toString().padStart(2, "0")}`);
    } else {
      onConfirm(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
    onClose();
  };

  const handleClockClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left - cx;
      const y = clientY - rect.top - cy;
      const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
      const normalizedAngle = ((angle % 360) + 360) % 360;
      const dist = Math.sqrt(x * x + y * y);

      if (mode === "hour") {
        const isInner = dist < cx * 0.55;
        const step = Math.round(normalizedAngle / 30) % 12;
        let newHour: number;
        if (isInner) {
          newHour = step; // 0-11
        } else {
          newHour = step === 0 ? 12 : step + 12; // 12-23
        }
        setHour(newHour);
        setTimeout(() => setMode("minute"), 350);
      } else {
        const step = Math.round(normalizedAngle / 6) % 60;
        setMinute(step);
      }
    },
    [mode]
  );

  const getHandAngle = () => {
    if (mode === "hour") return (hour % 12) * 30;
    return minute * 6;
  };

  const isInnerHour = mode === "hour" && hour < 12;
  const handLen = isInnerHour ? 28 : 38;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="bg-card rounded-3xl w-full max-w-[320px] shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 bg-secondary/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">
                {inputMode ? "Digitar horário" : "Selecionar horário"}
              </p>

              {inputMode ? (
                <div className="flex items-center gap-2 justify-center">
                  <div>
                    <input
                      type="text"
                      maxLength={2}
                      value={inputHour}
                      onChange={(e) => setInputHour(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="HH"
                      autoFocus
                      className="w-[72px] h-[68px] text-center text-4xl bg-primary/10 border-2 border-primary rounded-xl outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground text-center mt-1">Hora</p>
                  </div>
                  <span className="text-4xl text-foreground/30 mb-5">:</span>
                  <div>
                    <input
                      type="text"
                      maxLength={2}
                      value={inputMinute}
                      onChange={(e) => setInputMinute(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="MM"
                      className="w-[72px] h-[68px] text-center text-4xl bg-secondary border-2 border-transparent rounded-xl outline-none focus:border-primary focus:bg-primary/10 transition-colors"
                    />
                    <p className="text-[10px] text-muted-foreground text-center mt-1">Minuto</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1 justify-center">
                  <button
                    onClick={() => setMode("hour")}
                    className={`text-5xl px-3 py-1 rounded-xl transition-colors ${
                      mode === "hour" ? "bg-primary/15 text-primary" : "text-foreground/40"
                    }`}
                  >
                    {hour.toString().padStart(2, "0")}
                  </button>
                  <span className="text-5xl text-foreground/20">:</span>
                  <button
                    onClick={() => setMode("minute")}
                    className={`text-5xl px-3 py-1 rounded-xl transition-colors ${
                      mode === "minute" ? "bg-primary/15 text-primary" : "text-foreground/40"
                    }`}
                  >
                    {minute.toString().padStart(2, "0")}
                  </button>
                </div>
              )}
            </div>

            {/* Clock face */}
            {!inputMode && (
              <div className="px-5 py-4">
                <div
                  className="relative w-full aspect-square rounded-full bg-secondary/60 cursor-pointer select-none"
                  onClick={handleClockClick}
                  onTouchMove={(e) => { e.preventDefault(); handleClockClick(e); }}
                >
                  {/* Center dot */}
                  <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full bg-primary -translate-x-1/2 -translate-y-1/2 z-10" />

                  {/* Hand */}
                  <div
                    className="absolute bg-primary z-[5] transition-all duration-200 ease-out origin-bottom"
                    style={{
                      width: 2,
                      height: `${handLen}%`,
                      left: "calc(50% - 1px)",
                      bottom: "50%",
                      transform: `rotate(${getHandAngle()}deg)`,
                    }}
                  >
                    {/* Hand tip dot */}
                    <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-primary" />
                  </div>

                  {/* Outer numbers: hours 12-23 or minutes */}
                  {mode === "hour" ? (
                    <>
                      {HOURS_OUTER.map((hv) => {
                        const a = ((hv % 12) * 30 - 90) * (Math.PI / 180);
                        const r = 40;
                        const x = 50 + r * Math.cos(a);
                        const y = 50 + r * Math.sin(a);
                        const sel = hour === hv;
                        return (
                          <div
                            key={hv}
                            className="absolute flex items-center justify-center pointer-events-none"
                            style={{
                              left: `${x}%`, top: `${y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                              sel ? "bg-primary text-primary-foreground" : "text-foreground/80"
                            }`}>
                              {hv}
                            </span>
                          </div>
                        );
                      })}
                      {HOURS_INNER.map((hv) => {
                        const a = (hv * 30 - 90) * (Math.PI / 180);
                        const r = 25;
                        const x = 50 + r * Math.cos(a);
                        const y = 50 + r * Math.sin(a);
                        const sel = hour === hv;
                        return (
                          <div
                            key={`i${hv}`}
                            className="absolute flex items-center justify-center pointer-events-none"
                            style={{
                              left: `${x}%`, top: `${y}%`,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                              sel ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                            }`}>
                              {hv.toString().padStart(2, "0")}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    MINUTES.map((mv) => {
                      const a = (mv * 6 - 90) * (Math.PI / 180);
                      const r = 40;
                      const x = 50 + r * Math.cos(a);
                      const y = 50 + r * Math.sin(a);
                      const sel = minute === mv;
                      return (
                        <div
                          key={mv}
                          className="absolute flex items-center justify-center pointer-events-none"
                          style={{
                            left: `${x}%`, top: `${y}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${
                            sel ? "bg-primary text-primary-foreground" : "text-foreground/80"
                          }`}>
                            {mv.toString().padStart(2, "0")}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-5 pb-5 pt-1 flex items-center justify-between">
              <button
                onClick={() => {
                  if (!inputMode) {
                    setInputHour(hour.toString().padStart(2, "0"));
                    setInputMinute(minute.toString().padStart(2, "0"));
                  }
                  setInputMode(!inputMode);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
              >
                {inputMode ? (
                  <Clock className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Keyboard className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <div className="flex gap-1">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-sm text-primary hover:bg-primary/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-5 py-2.5 rounded-full text-sm text-primary hover:bg-primary/10 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TimePickerField({ value, onChange, className }: TimePickerFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className={`flex items-center justify-between text-left ${className || "w-full bg-secondary rounded-xl p-3 text-sm"}`}
      >
        <span className="text-lg">{value || "--:--"}</span>
        <Clock className="w-5 h-5 text-muted-foreground" />
      </button>

      <ClockDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValue={value || "08:00"}
        onConfirm={onChange}
      />
    </>
  );
}
