import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";

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
      <div className="surface-grid pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="glow-primary pointer-events-none absolute -top-20 left-1/2 size-96 -translate-x-1/2"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex justify-center">
          <Logo />
        </Link>
        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
