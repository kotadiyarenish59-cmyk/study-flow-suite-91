import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckSquare,
  NotebookPen,
  Target,
} from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { RoadmapTrack } from "@/components/shared/RoadmapTrack";
import { Button } from "@/components/ui/button";
import { roadmap } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyFlow — Learn smarter. Build your future." },
      {
        name: "description",
        content:
          "StudyFlow is one beautiful workspace to plan, learn, track and improve your study journey — subjects, tasks, notes, planner, progress and goals.",
      },
      { property: "og:title", content: "StudyFlow — Learn smarter. Build your future." },
      {
        property: "og:description",
        content: "Plan, learn, track and improve your study journey in one calm workspace.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BookOpen,
    title: "Manage Subjects",
    description: "Keep every subject, topic and completion state in one organised place.",
  },
  {
    icon: CheckSquare,
    title: "Track Tasks",
    description: "Plan study tasks with priorities, due dates and quick completion.",
  },
  {
    icon: BarChart3,
    title: "Monitor Progress",
    description: "See weekly study activity and subject performance at a glance.",
  },
  {
    icon: NotebookPen,
    title: "Organize Notes",
    description: "Write, pin and search clean notes tied to the subject you're learning.",
  },
  {
    icon: CalendarDays,
    title: "Plan Your Study",
    description: "Build a realistic weekly plan with times and durations you'll keep.",
  },
  {
    icon: Target,
    title: "Set Goals",
    description: "Turn ambitions into a step-by-step roadmap with deadlines and progress.",
  },
];

const steps = [
  { title: "Add your subjects", description: "Set up what you're learning and its topics." },
  { title: "Create study tasks", description: "Break subjects into focused, timed tasks." },
  { title: "Complete activities", description: "Work through focus sessions and check them off." },
  { title: "Track your progress", description: "Watch streaks, hours and mastery grow weekly." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main>
        {/* Hero */}
        <section id="home" className="relative overflow-hidden">
          <div className="surface-grid pointer-events-none absolute inset-0" aria-hidden />
          <div
            className="glow-primary pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2"
            aria-hidden
          />
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-24">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
                <span className="size-1.5 rounded-full bg-primary" /> Your calm study workspace
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Learn smarter. <br />
                <span className="text-gradient">Build your future.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
                One beautiful workspace to plan, learn, track and improve your study journey.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">
                    Start Learning <ArrowRight />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="#features">Explore Features</a>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  ["6", "Subjects"],
                  ["68%", "Progress"],
                  ["7", "Day streak"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-bold text-foreground">{value}</dt>
                    <dd className="text-xs text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative animate-rise lg:pl-6">
              <div
                className="glow-primary pointer-events-none absolute inset-8 -z-10"
                aria-hidden
              />
              <DashboardMockup />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-card/40 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything your study day needs
              </h2>
              <p className="mt-3 text-muted-foreground">
                Six focused tools, one consistent workspace — no clutter, no distractions.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Four simple steps from scattered notes to steady, measurable progress.
            </p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roadmap */}
        <section id="about" className="border-t border-border bg-card/40 py-20 sm:py-24">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                A roadmap that keeps you moving
              </h2>
              <p className="mt-3 text-muted-foreground">
                StudyFlow turns a long syllabus into an ordered path. You always know what's done,
                what you're on and what's next — so you never lose momentum.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                {[
                  "Clear completed, current and upcoming states",
                  "Built around your subjects and goals",
                  "Progress that updates as you study",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6">
              <RoadmapTrack steps={roadmap} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-violet px-6 py-14 text-center shadow-lift sm:px-12">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                Ready to make progress?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
                Set up your subjects in minutes and start your first focus session today.
              </p>
              <Button size="lg" variant="secondary" className="mt-8" asChild>
                <Link to="/signup">
                  Start Learning <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
