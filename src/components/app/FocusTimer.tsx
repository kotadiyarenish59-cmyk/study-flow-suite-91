import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const presets = [
  { label: "25 min focus", minutes: 25 },
  { label: "5 min break", minutes: 5 },
  { label: "50 min deep", minutes: 50 },
];

export function FocusTimer({ className }: { className?: string }) {
  const { addSession } = useStore();
  const [duration, setDuration] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setCompleted((c) => c + 1);
          addSession(duration);
          toast.success(`Focus session complete — ${duration} min logged`);
          return duration * 60;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, duration, addSession]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = 100 - (remaining / (duration * 60)) * 100;

  function pick(minutes: number) {
    setRunning(false);
    setDuration(minutes);
    setRemaining(minutes * 60);
  }

  return (
    <section
      className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}
      aria-label="Focus timer"
    >
      <div className="flex items-center gap-2">
        <Timer className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Focus Session</h2>
      </div>

      <div className="mt-5 flex flex-col items-center">
        <div className="relative grid size-40 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="45" className="fill-none stroke-muted" strokeWidth="6" />
            <circle
              cx="50"
              cy="50"
              r="45"
              className="fill-none stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
            />
          </svg>
          <span className="text-4xl font-bold tabular-nums tracking-tight text-foreground">
            {mm}:{ss}
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="hero" onClick={() => setRunning(true)} disabled={running}>
            <Play /> Start
          </Button>
          <Button variant="outline" onClick={() => setRunning(false)} disabled={!running}>
            <Pause /> Pause
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setRunning(false);
              setRemaining(duration * 60);
            }}
          >
            <RotateCcw /> Reset
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => pick(p.minutes)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                duration === p.minutes
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          {completed} session{completed === 1 ? "" : "s"} completed today
        </p>
      </div>
    </section>
  );
}
