import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Clock, Trophy, BookOpen, Target, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { RoadmapTrack } from "@/components/shared/RoadmapTrack";
import { Progress } from "@/components/ui/progress";
import { useStore, subjectProgress } from "@/lib/store";
import type { RoadmapStep } from "@/lib/types";

export const Route = createFileRoute("/app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — StudyFlow" },
      { name: "description", content: "Study minutes, subject mastery and achievements." },
      { property: "og:title", content: "Progress — StudyFlow" },
      { property: "og:description", content: "Study minutes, subject mastery and achievements." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { sessions, subjects, tasks, goals } = useStore();

  const totalMinutes = sessions.reduce((s, x) => s + x.minutes, 0);
  const maxSessionMin = Math.max(1, ...sessions.map((s) => s.minutes));
  const completedTasks = tasks.filter((t) => t.completed).length;

  // Dynamically compute roadmap steps from real database subjects
  const dynamicRoadmap: RoadmapStep[] = subjects.map((sub) => {
    const pct = subjectProgress(sub);
    let status: "completed" | "current" | "upcoming" = "upcoming";
    if (pct >= 100) {
      status = "completed";
    } else if (pct > 0) {
      status = "current";
    }
    return {
      id: sub.id,
      title: sub.name,
      status,
    };
  });

  // Dynamically compute completed goals count
  const completedGoals = goals.filter((g) => {
    const stepsList = g.milestones || g.steps || [];
    return (
      stepsList.length > 0 &&
      stepsList.every((s: any) => s.is_completed || s.done)
    );
  }).length;

  // Dynamically evaluate real user achievements
  const dynamicAchievements = [
    {
      id: "a1",
      icon: "📚",
      title: "First Subject",
      description: "Added your first study subject",
      unlocked: subjects.length > 0,
    },
    {
      id: "a2",
      icon: "🏆",
      title: "Task Finisher",
      description: "Completed at least 3 tasks",
      unlocked: completedTasks >= 3,
    },
    {
      id: "a3",
      icon: "🎯",
      title: "Goal Setter",
      description: "Created a learning goal",
      unlocked: goals.length > 0,
    },
    {
      id: "a4",
      icon: "🌟",
      title: "Goal Achiever",
      description: "Completed all milestones for a goal",
      unlocked: completedGoals >= 1,
    },
    {
      id: "a5",
      icon: "⚡",
      title: "Study Powerhouse",
      description: "Logged over 60 study minutes",
      unlocked: totalMinutes >= 60,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Progress" description="Your momentum over the last sessions." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Total minutes" value={totalMinutes} />
        <StatCard icon={BarChart3} label="Sessions" value={sessions.length} tone="violet" />
        <StatCard icon={Trophy} label="Tasks completed" value={completedTasks} tone="success" />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Study minutes</h2>
        {sessions.length > 0 ? (
          <div className="mt-5 flex h-40 items-end gap-2">
            {sessions.slice(-14).map((s) => (
              <div key={s.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                  style={{ height: `${(s.minutes / maxSessionMin) * 100}%` }}
                  title={`${s.minutes} min on ${s.date}`}
                />
                <span className="truncate text-[10px] text-muted-foreground">{s.date.slice(5)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center py-8 text-xs text-muted-foreground italic border border-dashed border-border/50 rounded-xl">
            No study sessions logged yet. Complete study sessions to see your progress chart!
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Subject mastery</h2>
        {subjects.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {subjects.map((s) => {
              const pct = subjectProgress(s);
              return (
                <li key={s.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm text-foreground">{s.name}</span>
                  <Progress value={pct} className="h-2 flex-1" />
                  <span className="w-10 shrink-0 text-right text-xs font-medium text-muted-foreground">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground italic">
            No subjects added yet. Add subjects to track your topic mastery.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Learning roadmap</h2>
          <div className="mt-4">
            {dynamicRoadmap.length > 0 ? (
              <RoadmapTrack steps={dynamicRoadmap} />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Add subjects to automatically generate your learning roadmap track.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {dynamicAchievements.map((a) => (
              <li
                key={a.id}
                className={
                  a.unlocked
                    ? "rounded-xl border border-border bg-card p-3 shadow-sm"
                    : "rounded-xl border border-dashed border-border p-3 opacity-50"
                }
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{a.icon}</span>
                  {a.unlocked && <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />}
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
