import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Clock, Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { RoadmapTrack } from "@/components/shared/RoadmapTrack";
import { Progress } from "@/components/ui/progress";
import { useStore, subjectProgress } from "@/lib/store";
import { achievements, roadmap } from "@/lib/mock-data";

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
  const { sessions, subjects, tasks } = useStore();
  const total = sessions.reduce((s, x) => s + x.minutes, 0);
  const max = Math.max(1, ...sessions.map((s) => s.minutes));
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Progress" description="Your momentum over the last sessions." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Total minutes" value={total} />
        <StatCard icon={BarChart3} label="Sessions" value={sessions.length} tone="violet" />
        <StatCard icon={Trophy} label="Tasks completed" value={completed} tone="success" />
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Study minutes</h2>
        <div className="mt-5 flex h-40 items-end gap-2">
          {sessions.slice(-14).map((s) => (
            <div key={s.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-primary/80"
                style={{ height: `${(s.minutes / max) * 100}%` }}
                title={`${s.minutes} min on ${s.date}`}
              />
              <span className="truncate text-[10px] text-muted-foreground">{s.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Subject mastery</h2>
        <ul className="mt-4 space-y-3">
          {subjects.map((s) => (
            <li key={s.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-foreground">{s.name}</span>
              <Progress value={subjectProgress(s)} className="h-1.5 flex-1" />
              <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                {subjectProgress(s)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Learning roadmap</h2>
          <div className="mt-4">
            <RoadmapTrack steps={roadmap} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {achievements.map((a) => (
              <li
                key={a.id}
                className={
                  a.unlocked
                    ? "rounded-xl border border-border p-3"
                    : "rounded-xl border border-dashed border-border p-3 opacity-60"
                }
              >
                <p className="text-lg">{a.icon}</p>
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
