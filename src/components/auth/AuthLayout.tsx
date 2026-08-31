import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Sparkles, GraduationCap, ShieldCheck } from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Background grid pattern & animated background glows */}
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
      <div
        className="glow-primary pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full blur-3xl opacity-60 animate-pulse"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/4 size-96 rounded-full bg-violet/20 blur-3xl opacity-50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-20 size-80 rounded-full bg-primary/10 blur-3xl opacity-40"
        aria-hidden
      />

      <div className="relative w-full max-w-md animate-rise">
        {/* Top Header & Logo */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="inline-flex transition-transform hover:scale-105">
            <Logo />
          </Link>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary shadow-soft">
            <Sparkles className="size-3.5" />
            <span>StudyFlow Workspace</span>
          </div>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="mt-6 rounded-3xl border border-border/80 bg-card/95 p-6 shadow-lift backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <div>{children}</div>
        </div>

        {/* Card Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>

        {/* Security / Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" /> Encrypted &amp; Secure
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="size-4 text-violet" /> Built for Students
          </span>
        </div>
      </div>
    </div>
  );
}
