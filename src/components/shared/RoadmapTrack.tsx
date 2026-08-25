import { Check, ChevronDown, Circle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapStep } from "@/lib/types";

export function RoadmapTrack({ steps }: { steps: RoadmapStep[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={step.id}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3 transition-colors sm:p-4",
              step.status === "completed" && "border-success/25 bg-success/5",
              step.status === "current" && "border-primary/40 bg-primary/5 shadow-lift",
              step.status === "upcoming" && "border-border bg-card",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl",
                step.status === "completed" && "bg-success/15 text-success",
                step.status === "current" && "bg-primary text-primary-foreground",
                step.status === "upcoming" && "bg-muted text-muted-foreground",
              )}
            >
              {step.status === "completed" ? (
                <Check className="size-4" />
              ) : step.status === "current" ? (
                <Play className="size-4" />
              ) : (
                <Circle className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-semibold",
                  step.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {step.title}
              </p>
              <p className="text-xs capitalize text-muted-foreground">{step.status}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className="flex justify-start pl-7">
              <ChevronDown className="size-4 text-muted-foreground/50" />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
