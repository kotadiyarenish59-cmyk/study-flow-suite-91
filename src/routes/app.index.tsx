import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, CheckSquare, Clock, Flame } from "lucide-react";
import { FocusTimer } from "@/components/app/FocusTimer";
import { TaskItem } from "@/components/app/TaskItem";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyFlow" },
      { name: "description", content: "Your study overview, focus timer and today's tasks." },
      { property: "og:title", content: "Dashboard — StudyFlow" },
      { property: "og:description", content: "Your study overview, focus timer and today's tasks." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, subjects, tasks, sessions, setTasks } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);
  const topicsDone = subjects.reduce(
    (sum, s) => sum + s.topics.filter((t) => t.done).length,
    0,
  );

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi ${user?.name?.split(" ")[0] || "there"} 👋`}
        description="Here's how your learning is going today."
        action={
          <Button variant="hero" asChild>
            <Link to="/app/tasks">Add task</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Minutes studied" value={totalMinutes} tone="primary" />
        <StatCard icon={CheckSquare} label="Tasks today" value={todayTasks.length} tone="warning" />
        <StatCard icon={BookOpen} label="Topics completed" value={topicsDone} tone="success" />
        <StatCard icon={Flame} label="Subjects" value={subjects.length} tone="violet" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Today&apos;s tasks</h2>
          {todayTasks.length ? (
            <ul className="space-y-3">
              {todayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  subjectName={subjects.find((s) => s.id === task.subjectId)?.name}
                  onToggle={() => toggle(task.id)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CheckSquare}
              title="Nothing due today"
              description="Add a task to plan your study session."
            />
          )}
        </section>
        <FocusTimer />
      </div>
    </div>
  );
}
