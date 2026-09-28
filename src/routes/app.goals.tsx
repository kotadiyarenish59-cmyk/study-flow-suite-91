import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Target, Trash2, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
  const { goals, addGoal, toggleMilestone, deleteGoal } = useStore();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [targetDate, setTargetDate] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMilestone = () => {
    if (!milestoneInput.trim()) return;
    setMilestones([...milestones, milestoneInput.trim()]);
    setMilestoneInput("");
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a goal title.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addGoal({
        title,
        category,
        target_date: targetDate || undefined,
        milestones: milestones.length > 0 ? milestones : undefined,
      });
      toast.success("Goal created successfully!");
      setTitle("");
      setCategory("General");
      setTargetDate("");
      setMilestones([]);
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create goal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      toast.success("Goal deleted.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete goal.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Goals" description="Long-term targets and their milestones." />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[485px]">
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Define your learning target and break it down into key milestones.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal Title *</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g. Master React & FastAPI"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="goal-category">Category</Label>
                    <Input
                      id="goal-category"
                      placeholder="e.g. Web Dev"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-date">Target Date</Label>
                    <Input
                      id="goal-date"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Milestones (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add milestone step..."
                      value={milestoneInput}
                      onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMilestone();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={handleAddMilestone}>
                      Add
                    </Button>
                  </div>
                  {milestones.length > 0 && (
                    <ul className="mt-2 space-y-1 rounded-lg border border-border p-2 text-xs">
                      {milestones.map((m, idx) => (
                        <li key={idx} className="flex items-center justify-between rounded px-2 py-1 hover:bg-accent">
                          <span>• {m}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(idx)}
                            className="text-destructive hover:underline text-xs"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Create Goal"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {goals.map((goal) => {
            const stepsList = goal.milestones || goal.steps || [];
            const doneCount = stepsList.filter((s: any) => s.is_completed || s.done).length;
            const pct = stepsList.length > 0 ? Math.round((doneCount / stepsList.length) * 100) : 0;
            const displayDate = goal.target_date || goal.deadline;

            return (
              <section key={goal.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {goal.category || "General"}
                    </span>
                    <h2 className="mt-2 text-base font-semibold text-foreground">{goal.title}</h2>
                    {goal.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(goal.id)}
                    title="Delete Goal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Progress</span>
                    <span>{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>

                {stepsList.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {stepsList.map((step: any) => {
                      const isDone = Boolean(step.is_completed || step.done);
                      return (
                        <li key={step.id}>
                          <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer select-none">
                            <Checkbox
                              checked={isDone}
                              onCheckedChange={() => toggleMilestone(goal.id, step.id)}
                            />
                            <span className={isDone ? "line-through text-muted-foreground" : ""}>
                              {step.title}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {displayDate && (
                  <div className="flex items-center gap-1.5 pt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Target Date: {displayDate}</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Target} title="No goals yet" description="Set a goal to stay motivated and track your progress." />
      )}
    </div>
  );
}
