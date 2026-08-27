import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen, Pin, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore, uid } from "@/lib/store";

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Notes — StudyFlow" },
      { name: "description", content: "Capture and pin your study notes in one place." },
      { property: "og:title", content: "Notes — StudyFlow" },
      { property: "og:description", content: "Capture and pin your study notes in one place." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { notes, setNotes } = useStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");

  const visible = notes
    .filter((n) => (n.title + n.content).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setNotes((prev) => [
      {
        id: uid(),
        title: title.trim(),
        content: content.trim(),
        pinned: false,
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setTitle("");
    setContent("");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Notes" description="Your quick reference library." />

      <form onSubmit={addNote} className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" aria-label="Note title" />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something worth remembering…"
          aria-label="Note content"
        />
        <Button type="submit" variant="hero">
          Save note
        </Button>
      </form>

      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notes…" aria-label="Search notes" />

      {visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((note) => (
            <article key={note.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <h2 className="truncate text-sm font-semibold text-foreground">{note.title}</h2>
                <div className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Pin note"
                    onClick={() =>
                      setNotes((prev) =>
                        prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)),
                      )
                    }
                  >
                    <Pin className={note.pinned ? "text-primary" : undefined} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete note"
                    onClick={() => setNotes((prev) => prev.filter((n) => n.id !== note.id))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{note.content}</p>
              <p className="mt-3 text-xs text-muted-foreground">Updated {note.updatedAt}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={NotebookPen} title="No notes yet" description="Write your first note above." />
      )}
    </div>
  );
}
