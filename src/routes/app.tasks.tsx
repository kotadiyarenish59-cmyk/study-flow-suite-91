import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { TaskItem } from "@/components/app/TaskItem";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { sendToWebhook } from "@/lib/webhook";
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
  const { tasks, subjects, addTask, toggleTask, deleteTask } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [title, setTitle] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const firstSubject = subjects[0];
    if (firstSubject && (!selectedSubjectId || !subjects.some((s) => s.id === selectedSubjectId))) {
      setSelectedSubjectId(firstSubject.id);
    }
  }, [subjects, selectedSubjectId]);

  const visible = tasks.filter((t) =>
    filter === "today"
      ? t.dueDate === today
      : filter === "pending"
        ? !t.completed
        : filter === "completed"
          ? t.completed
          : true,
  );

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }
    if (!selectedSubjectId) {
      toast.error("Please select a subject or create one first in the Subjects page.");
      return;
    }

    setIsSubmitting(true);
    try {
      const priority: Priority = "medium";
      const newTask = await addTask({
        title: title.trim(),
        subject_id: selectedSubjectId,
        due_date: today,
        priority,
      });

      sendToWebhook({ ...newTask });
      setTitle("");
      toast.success("Task added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      await toggleTask(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update task status.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask(id);
      toast.success("Task deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Everything you planned to study." />

      <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task…"
          aria-label="New task title"
          disabled={isSubmitting}
          className="flex-1"
        />

        {subjects.length > 0 ? (
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isSubmitting}
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        ) : (
          <Button variant="outline" asChild>
            <Link to="/app/subjects">+ Create Subject First</Link>
          </Button>
        )}

        <Button type="submit" variant="hero" disabled={isSubmitting || subjects.length === 0}>
          <Plus className="size-4 mr-1" /> Add
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
              subjectName={subjects.find((s) => s.id === task.subjectId || s.id === task.subject_id)?.name}
              onToggle={() => handleToggle(task.id)}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState icon={CheckSquare} title="No tasks here" description="Try another filter or add a task." />
      )}
    </div>
  );
}
