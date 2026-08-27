import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { SubjectCard } from "@/components/app/SubjectCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — StudyFlow" },
      { name: "description", content: "Track topics and progress across every subject." },
      { property: "og:title", content: "Subjects — StudyFlow" },
      { property: "og:description", content: "Track topics and progress across every subject." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { subjects, setSubjects } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = subjects.find((s) => s.id === openId);

  const toggleTopic = (subjectId: string, topicId: string) =>
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: s.topics.map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)),
            }
          : s,
      ),
    );

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description="Open a subject to tick off topics." />

      {subjects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onOpen={() => setOpenId(openId === subject.id ? null : subject.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No subjects yet" description="Add your first subject." />
      )}

      {open && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">{open.name} topics</h2>
            <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {open.topics.map((topic) => (
              <li key={topic.id}>
                <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-foreground">
                  <Checkbox
                    checked={topic.done}
                    onCheckedChange={() => toggleTopic(open.id, topic.id)}
                  />
                  {topic.title}
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
