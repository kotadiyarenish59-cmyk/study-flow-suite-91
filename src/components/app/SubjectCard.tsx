import { BookOpen, ChevronRight, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { subjectProgress } from "@/lib/store";
import type { Subject } from "@/lib/types";

interface SubjectCardProps {
  subject: Subject;
  onOpen: () => void;
  onDelete?: () => void;
}

export function SubjectCard({ subject, onOpen, onDelete }: SubjectCardProps) {
  const progress = subjectProgress(subject);
  const done = (subject.topics || []).filter((t) => t.done).length;
  const totalTopics = (subject.topics || []).length;

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group relative w-full rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card cursor-pointer select-none"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="size-5" />
        </span>
        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete subject"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
      <h3 className="mt-4 truncate text-base font-semibold text-foreground">{subject.name}</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {done} / {totalTopics} topics
      </p>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={progress} className="h-1.5 flex-1" />
        <span className="shrink-0 text-sm font-semibold text-foreground">{progress}%</span>
      </div>
    </div>
  );
}
