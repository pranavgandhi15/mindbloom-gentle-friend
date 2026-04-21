import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Phase = "inhale" | "hold" | "exhale";

const SEQUENCE: { phase: Phase; label: string; seconds: number }[] = [
  { phase: "inhale", label: "Breathe in", seconds: 4 },
  { phase: "hold", label: "Hold gently", seconds: 4 },
  { phase: "exhale", label: "Breathe out", seconds: 6 },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BreathingExercise({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(SEQUENCE[0].seconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setCount(SEQUENCE[0].seconds);
  }, [open]);

  useEffect(() => {
    if (!open) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setStep((s) => (s + 1) % SEQUENCE.length);
        return 0; // will be reset by next effect
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [open]);

  useEffect(() => {
    setCount(SEQUENCE[step].seconds);
  }, [step]);

  if (!open) return null;

  const current = SEQUENCE[step];
  const scale =
    current.phase === "inhale" ? 1.4 : current.phase === "exhale" ? 0.8 : 1.2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up"
      style={{ background: "oklch(0.32 0.025 150 / 0.55)", backdropFilter: "blur(8px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Breathing exercise"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 rounded-full bg-card/80 p-2 text-foreground/70 transition hover:bg-card hover:text-foreground"
        aria-label="Close breathing exercise"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-col items-center gap-8 text-center">
        <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
          <div
            className="absolute h-full w-full rounded-full opacity-30"
            style={{ background: "var(--gradient-warmth)" }}
          />
          <div
            className="absolute h-full w-full rounded-full transition-transform ease-in-out"
            style={{
              transform: `scale(${scale})`,
              transitionDuration: `${current.seconds}s`,
              background:
                "radial-gradient(circle, oklch(0.85 0.06 145 / 0.7) 0%, oklch(0.78 0.07 25 / 0.4) 70%, transparent 100%)",
              boxShadow: "var(--shadow-glow)",
            }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <p className="font-serif text-3xl text-foreground sm:text-4xl">
              {current.label}
            </p>
            <p className="mt-3 text-5xl font-light tabular-nums text-foreground/80">
              {count}
            </p>
          </div>
        </div>

        <p className="max-w-xs text-sm text-foreground/70">
          Follow the circle. There's nowhere else you need to be right now.
        </p>
      </div>
    </div>
  );
}
