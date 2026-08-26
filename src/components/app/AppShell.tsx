import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Home,
  LogOut,
  Moon,
  NotebookPen,
  Plus,
  Settings,
  Sun,
  Target,
  User,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/app", label: "Dashboard", icon: Home, exact: true },
  { to: "/app/subjects", label: "Subjects", icon: BookOpen },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/notes", label: "Notes", icon: NotebookPen },
  { to: "/app/planner", label: "Planner", icon: CalendarDays },
  { to: "/app/progress", label: "Progress", icon: BarChart3 },
  { to: "/app/goals", label: "Goals", icon: Target },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

const mobileItems = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/subjects", label: "Learn", icon: BookOpen },
  { to: "/app/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/app/progress", label: "Progress", icon: BarChart3 },
  { to: "/app/settings", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "S";

  function handleSignOut() {
    signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-5">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item ? item.exact : false }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.name || "Student"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email || user?.phone || "Local demo account"}
              </p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
              <LogOut />
            </Button>
          </div>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl lg:pl-64">
        <div className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:px-6">
          <div className="min-w-0 lg:hidden">
            <Link to="/app">
              <Logo />
            </Link>
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggle}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden sm:inline-flex">
              <Bell />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-violet text-xs font-bold text-primary-foreground"
                >
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{user?.name || "Student"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggle}>
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pl-6 lg:pr-6">
        <div className="lg:pl-64">{children}</div>
      </main>

      {/* Floating quick action (mobile) */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        {fabOpen && (
          <div className="mb-3 flex flex-col items-end gap-2">
            {[
              { to: "/app/tasks", label: "New task" },
              { to: "/app/notes", label: "New note" },
              { to: "/app/subjects", label: "New subject" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                onClick={() => setFabOpen(false)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-card"
              >
                {a.label}
              </Link>
            ))}
          </div>
        )}
        <Button
          size="icon"
          variant="hero"
          aria-label="Quick actions"
          aria-expanded={fabOpen}
          onClick={() => setFabOpen((v) => !v)}
          className={cn("size-14 rounded-full transition-transform", fabOpen && "rotate-45")}
        >
          <Plus className="size-6" />
        </Button>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {mobileItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:text-primary"
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
