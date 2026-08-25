import { Logo } from "@/components/Logo";

const links = ["About", "Features", "Contact", "Privacy", "Terms"];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            One beautiful workspace for your entire study journey.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} StudyFlow. Built for focused learners.
      </div>
    </footer>
  );
}
