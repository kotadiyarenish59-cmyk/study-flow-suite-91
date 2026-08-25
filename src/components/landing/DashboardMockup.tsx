import { CheckCircle2, Flame, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const bars = [40, 65, 30, 80, 55, 90, 70];

export function DashboardMockup() {
  return (
    <div className="animate-float rounded-3xl border border-border bg-card p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Good morning</p>
          <p className="truncate text-base font-bold text-foreground">Your study day</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
          <Flame className="size-3.5" /> 7 day streak
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Overall progress</p>
          <p className="mt-1 text-2xl font-bold text-foreground">68%</p>
          <Progress value={68} className="mt-2 h-1.5" />
        </div>
        <div className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs text-muted-foreground">Tasks done</p>
          <p className="mt-1 text-2xl font-bold text-foreground">24</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-success">
            <TrendingUp className="size-3.5" /> +6 this week
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-background p-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Target className="size-3.5 text-primary" /> Focus today
        </p>
        <ul className="mt-2 space-y-2">
          {[
            ["Python Functions", "30 min"],
            ["SQL Practice", "45 min"],
          ].map(([title, time]) => (
            <li key={title} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="size-4 shrink-0 text-muted-foreground/50" />
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">{title}</span>
              <span className="shrink-0 text-muted-foreground">{time}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-background p-3">
        <p className="text-xs font-semibold text-foreground">Weekly activity</p>
        <div className="mt-3 flex h-20 items-end gap-1.5">
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary/40 to-violet"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
