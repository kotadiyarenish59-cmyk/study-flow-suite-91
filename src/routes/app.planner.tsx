import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useStore } from "@/lib/store";
import { weekDays } from "@/lib/mock-data";

export const Route = createFileRoute("/app/planner")({
  head: () => ({
    meta: [
      { title: "Weekly Planner — StudyFlow" },
      { name: "description", content: "See your study week at a glance, day by day." },
      { property: "og:title", content: "Weekly Planner — StudyFlow" },
      { property: "og:description", content: "See your study week at a glance, day by day." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { planner, subjects } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Weekly planner" description="Your recurring study schedule." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {weekDays.map((day) => {
          const events = planner.filter((p) => p.day === day);
          return (
            <section key={day} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="size-4 text-primary" />
                {day}
              </h2>
              <ul className="mt-3 space-y-2">
                {events.length ? (
                  events.map((e) => (
                    <li key={e.id} className="rounded-xl bg-accent/60 px-3 py-2">
                      <p className="text-sm font-medium text-foreground">{e.activity}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.start} · {e.minutes} min
                        {e.subjectId
                          ? ` · ${subjects.find((s) => s.id === e.subjectId)?.name ?? ""}`
                          : ""}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">Free day</li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
