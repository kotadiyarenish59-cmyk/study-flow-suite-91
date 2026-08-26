import { Clock, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

export function TaskItem({
  task,
  subjectName,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  subjectName?: string;
  onToggle: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-soft transition-colors hover:border-primary/30 sm:p-4">
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        aria-label={`Mark ${task.title} ${task.completed ? "incomplete" : "complete"}`}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold text-foreground",
            task.completed && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {subjectName && <span className="font-medium text-primary">{subjectName}</span>}
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {task.minutes} min
          </span>
          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <PriorityBadge priority={task.priority} />
        {onEdit && (
          <Button variant="ghost" size="icon" aria-label="Edit task" onClick={onEdit}>
            <Pencil />
          </Button>
        )}
        {onDelete && (
          <Button variant="ghost" size="icon" aria-label="Delete task" onClick={onDelete}>
            <Trash2 />
          </Button>
        )}
      </div>
    </li>
  );
}
