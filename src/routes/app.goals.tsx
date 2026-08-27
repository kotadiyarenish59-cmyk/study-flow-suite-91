import { createFileRoute } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/goals")({
  head: () => ({
    meta: [
      { title: "Goals — StudyFlow" },
      { name: "description", content: "Break big learning goals into achievable steps." },
      { property: "og:title", content: "Goals — StudyFlow" },
      { property: "og:description", content: "Break big learning goals into achievable steps." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, setGoals } = useStore();

  const toggleStep = (goalId: string, stepId: string) =>
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, steps: g.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) }
          : g,
      ),
    );

  return (
    <div className="space-y-6">
      <PageHeader title="Goals" description="Long-term targets and their milestones." />

      {goals.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const done = goal.steps.filter((s) => s.done).length;
            const pct = Math.round((done / Math.max(1, goal.steps.length)) * 100);
            return (
              <section key={goal.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <h2 className="text-base font-semibold text-foreground">{goal.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-sm font-semibold text-foreground">{pct}%</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {goal.steps.map((step) => (
                    <li key={step.id}>
                      <label className="flex items-center gap-3 text-sm text-foreground">
                        <Checkbox checked={step.done} onCheckedChange={() => toggleStep(goal.id, step.id)} />
                        {step.title}
                      </label>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">Target: {goal.deadline}</p>
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Target} title="No goals yet" description="Set a goal to stay motivated." />
      )}
    </div>
  );
}
