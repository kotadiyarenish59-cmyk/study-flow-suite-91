import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const { user, signOut } = useStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your profile and preferences." />

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" defaultValue={user?.name ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-email">Email</Label>
            <Input id="p-email" defaultValue={user?.email ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-phone">Phone</Label>
            <Input id="p-phone" defaultValue={user?.phone ?? ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-goal">Learning goal</Label>
            <Input id="p-goal" defaultValue={user?.goal ?? ""} readOnly />
          </div>
        </div>
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
