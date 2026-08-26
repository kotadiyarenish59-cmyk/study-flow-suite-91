import { BookOpen, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { subjectProgress } from "@/lib/store";
import type { Subject } from "@/lib/types";

export function SubjectCard({ subject, onOpen }: { subject: Subject; onOpen: () => void }) {
  const progress = subjectProgress(subject);
  const done = subject.topics.filter((t) => t.done).length;

  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="size-5" />
        </span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <h3 className="mt-4 truncate text-base font-semibold text-foreground">{subject.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {done} / {subject.topics.length} topics
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="shrink-0 text-sm font-semibold text-foreground">{progress}%</span>
      </div>
    </button>
  );
}
