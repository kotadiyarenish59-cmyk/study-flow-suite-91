import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet text-primary-foreground shadow-lift">
        <GraduationCap className="size-5" />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-foreground">StudyFlow</span>
      )}
    </span>
  );
}
