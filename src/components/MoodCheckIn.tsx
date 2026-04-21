import { cn } from "@/lib/utils";

export const MOODS = [
  { emoji: "😞", label: "Low" },
  { emoji: "😟", label: "Anxious" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Calm" },
  { emoji: "😊", label: "Bright" },
] as const;

export type MoodLabel = (typeof MOODS)[number]["label"];

type Props = {
  selected: string | null;
  onSelect: (mood: MoodLabel) => void;
  compact?: boolean;
};

export function MoodCheckIn({ selected, onSelect, compact }: Props) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border/60 bg-card/70 backdrop-blur-sm",
        compact ? "p-3" : "p-5",
      )}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      {!compact && (
        <p className="mb-3 text-center font-serif text-lg text-foreground/90">
          How are you feeling right now?
        </p>
      )}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {MOODS.map((m) => {
          const active = selected === m.label;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => onSelect(m.label)}
              className={cn(
                "group flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-all",
                "hover:-translate-y-0.5 hover:bg-accent/60",
                active && "bg-accent shadow-inner ring-1 ring-primary/30",
              )}
              aria-pressed={active}
              aria-label={m.label}
            >
              <span
                className={cn(
                  "text-2xl transition-transform sm:text-3xl",
                  active && "scale-110",
                )}
              >
                {m.emoji}
              </span>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs",
                  active && "text-foreground",
                )}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
