import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — StudyFlow" },
      { name: "description", content: "Manage your StudyFlow profile and appearance." },
      { property: "og:title", content: "Settings — StudyFlow" },
      { property: "og:description", content: "Manage your StudyFlow profile and appearance." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateProfile, signOut } = useStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [learningGoal, setLearningGoal] = useState(user?.goal ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setLearningGoal(user.goal ?? "");
    }
  }, [user]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        full_name: name,
        email,
        phone,
        learning_goal: learningGoal,
        goal: learningGoal,
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your profile and preferences." />

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-phone">Phone</Label>
              <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="flex items-center rounded-l-md border-r border-border bg-muted/60 px-3 text-xs font-semibold text-muted-foreground select-none">
                   +91
                </span>
                <Input
                  id="p-phone"
                  name="phone"
                  type="tel"
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none"
                  value={phone.replace(/^\+91\s?/, "")}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!raw.trim()) {
                      setPhone("");
                    } else {
                      setPhone(`+91 ${raw.replace(/^\+91\s?/, "")}`);
                    }
                  }}
                  placeholder=""
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-goal">Learning goal</Label>
              <Input
                id="p-goal"
                name="learning_goal"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Master Full-Stack Development"
              />
            </div>
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </section>

      <section className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="text-xs text-muted-foreground">Currently using {theme} mode.</p>
        </div>
        <Button variant="outline" onClick={toggle}>
          Switch to {theme === "dark" ? "light" : "dark"}
        </Button>
      </section>

      <Button
        variant="destructive"
        onClick={() => {
          signOut();
          navigate({ to: "/login", replace: true });
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

