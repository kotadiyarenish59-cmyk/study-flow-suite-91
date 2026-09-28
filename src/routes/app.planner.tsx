import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Plus, Trash2, Pencil, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { weekDays } from "@/lib/mock-data";
import type { PlannerEvent } from "@/lib/types";

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
  const { planner, subjects, addPlannerEvent, updatePlannerEvent, deletePlannerEvent } = useStore();

  const [openModal, setOpenModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);

  const [day, setDay] = useState<string>("Monday");
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [subjectId, setSubjectId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = (targetDay?: string) => {
    setEditingEvent(null);
    setDay(targetDay || "Monday");
    setTitle("");
    setStartTime("09:00 AM");
    setEndTime("10:00 AM");
    setSubjectId(subjects.length > 0 ? subjects[0].id : "");
    setOpenModal(true);
  };

  const handleOpenEdit = (event: PlannerEvent) => {
    setEditingEvent(event);
    setDay(event.day_of_week || event.day || "Monday");
    setTitle(event.title || event.activity || "");
    setStartTime(event.start_time || event.start || "09:00 AM");
    setEndTime(event.end_time || "10:00 AM");
    setSubjectId(event.subject_id || event.subjectId || "");
    setOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a session title.");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingEvent) {
        await updatePlannerEvent(editingEvent.id, {
          day_of_week: day,
          title,
          start_time: startTime,
          end_time: endTime,
          subject_id: subjectId || null,
        });
        toast.success("Session updated successfully!");
      } else {
        await addPlannerEvent({
          day_of_week: day,
          title,
          start_time: startTime,
          end_time: endTime,
          subject_id: subjectId || null,
        });
        toast.success("Session scheduled!");
      }
      setOpenModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save session.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlannerEvent(id);
      toast.success("Session deleted.");
      if (editingEvent?.id === id) {
        setOpenModal(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete session.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Weekly planner" description="Your recurring study schedule." />
        <Button onClick={() => handleOpenAdd()}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Session
        </Button>
      </div>

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Scheduled Session" : "Schedule New Session"}</DialogTitle>
              <DialogDescription>
                Set up your time slot and study subject for the week.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="plan-day">Day of Week</Label>
                <select
                  id="plan-day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {weekDays.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-title">Title / Activity *</Label>
                <Input
                  id="plan-title"
                  placeholder="e.g. Chapter 4 Review & Exercises"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-start">Start Time</Label>
                  <Input
                    id="plan-start"
                    placeholder="e.g. 09:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-end">End Time</Label>
                  <Input
                    id="plan-end"
                    placeholder="e.g. 10:30 AM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-subject">Subject (Optional)</Label>
                <select
                  id="plan-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">-- None / General --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {editingEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => handleDelete(editingEvent.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Session"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {weekDays.map((d) => {
          const events = planner.filter((p) => (p.day_of_week || p.day) === d);
          return (
            <section key={d} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <CalendarDays className="size-4 text-primary" />
                    {d}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleOpenAdd(d)}
                    title={`Add session to ${d}`}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <ul className="mt-3 space-y-2.5">
                  {events.length > 0 ? (
                    events.map((e) => {
                      const subName = subjects.find(
                        (s) => s.id === (e.subject_id || e.subjectId)
                      )?.name;
                      const timeStr = `${e.start_time || e.start || ""}${e.end_time ? " - " + e.end_time : ""}`;

                      return (
                        <li
                          key={e.id}
                          className="group relative rounded-xl border border-border/50 bg-accent/40 p-3 transition-colors hover:bg-accent/80 hover:border-primary/30"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground leading-snug">
                              {e.title || e.activity}
                            </p>
                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(e)}
                                className="text-muted-foreground hover:text-primary p-0.5"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(e.id)}
                                className="text-muted-foreground hover:text-destructive p-0.5"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timeStr}
                            </span>
                            {subName && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                {subName}
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="py-6 text-center text-xs text-muted-foreground italic border border-dashed border-border/40 rounded-xl">
                      No sessions scheduled
                    </li>
                  )}
                </ul>
              </div>

              <div className="mt-4 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleOpenAdd(d)}
                >
                  <Plus className="mr-1 h-3 w-3" /> Add Slot
                </Button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
