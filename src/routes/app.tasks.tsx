import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { TaskItem } from "@/components/app/TaskItem";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, uid } from "@/lib/store";
import type { Priority } from "@/lib/types";

export const Route = createFileRoute("/app/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — StudyFlow" },
      { name: "description", content: "Plan, prioritise and complete your study tasks." },
      { property: "og:title", content: "Tasks — StudyFlow" },
      { property: "og:description", content: "Plan, prioritise and complete your study tasks." },
    ],
  }),
  component: TasksPage,
});

const filters = ["all", "today", "pending", "completed"] as const;

function TasksPage() {
  const { tasks, subjects, setTasks } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [title, setTitle] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const visible = tasks.filter((t) =>
    filter === "today"
      ? t.dueDate === today
      : filter === "pending"
        ? !t.completed
        : filter === "completed"
          ? t.completed
          : true,
  );

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const priority: Priority = "medium";
    setTasks((prev) => [
      { id: uid(), title: title.trim(), priority, dueDate: today, minutes: 30, completed: false },
      ...prev,
    ]);
    setTitle("");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Everything you planned to study." />

      <form onSubmit={addTask} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task…"
          aria-label="New task title"
        />
        <Button type="submit" variant="hero">
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      {visible.length ? (
        <ul className="space-y-3">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              subjectName={subjects.find((s) => s.id === task.subjectId)?.name}
              onToggle={() =>
                setTasks((prev) =>
                  prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)),
                )
              }
              onDelete={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={CheckSquare} title="No tasks here" description="Try another filter or add a task." />
      )}
    </div>
  );
}
