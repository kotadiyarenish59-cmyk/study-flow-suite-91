import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SubjectCard } from "@/components/app/SubjectCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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
  const { subjects, addSubject, deleteSubject, setSubjects } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const open = subjects.find((s) => s.id === openId);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name.");
      return;
    }
    setIsAdding(true);
    try {
      await addSubject(newSubjectName.trim());
      setNewSubjectName("");
      toast.success("Subject created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create subject.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteSubject(id);
      if (openId === id) setOpenId(null);
      toast.success("Subject deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subject.");
    }
  };

  const toggleTopic = (subjectId: string, topicId: string) =>
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: (s.topics || []).map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)),
            }
          : s,
      ),
    );

  return (
    <div className="space-y-6">
      <PageHeader title="Subjects" description="Manage your subjects and track your progress." />

      <form onSubmit={handleAddSubject} className="flex gap-2 max-w-md">
        <Input
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
          placeholder="New subject name (e.g. Mathematics)"
          aria-label="New subject name"
          disabled={isAdding}
        />
        <Button type="submit" variant="hero" disabled={isAdding}>
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </form>

      {subjects.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <div key={subject.id} className="group relative">
              <SubjectCard
                subject={subject}
                onOpen={() => setOpenId(openId === subject.id ? null : subject.id)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSubject(subject.id, subject.name);
                }}
                title="Delete subject"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={BookOpen} title="No subjects yet" description="Add your first subject above." />
      )}

      {open && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">{open.name} topics</h2>
            <Button variant="ghost" size="sm" onClick={() => setOpenId(null)}>
              Close
            </Button>
          </div>
          {open.topics && open.topics.length > 0 ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {open.topics.map((topic) => (
                <li key={topic.id}>
                  <label className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-foreground cursor-pointer">
                    <Checkbox
                      checked={topic.done}
                      onCheckedChange={() => toggleTopic(open.id, topic.id)}
                    />
                    {topic.title}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">No topics created yet for this subject.</p>
          )}
        </section>
      )}
    </div>
  );
}
