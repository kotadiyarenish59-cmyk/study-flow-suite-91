import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, uid } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — StudyFlow" },
      { name: "description", content: "Log in to your StudyFlow study workspace." },
      { property: "og:title", content: "Log in — StudyFlow" },
      { property: "og:description", content: "Log in to your StudyFlow study workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Record<string, string> = {};
    if (!identifier.trim()) next.identifier = "Enter your email or phone number.";
    else if (!/^\S+@\S+\.\S+$/.test(identifier) && !/^\+?\d[\d\s-]{7,}$/.test(identifier))
      next.identifier = "That doesn't look like a valid email or phone number.";
    if (!password) next.password = "Enter your password.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Demo auth only: no password is ever stored. Swap this for a real backend later.
    await new Promise((r) => setTimeout(r, 600));
    const isEmail = identifier.includes("@");
    signIn({
      id: uid(),
      name: isEmail ? identifier.split("@")[0] : "Student",
      email: isEmail ? identifier : "",
      phone: isEmail ? "" : identifier,
    });
    setLoading(false);
    toast.success("Welcome back to StudyFlow");
    navigate({ to: "/app" });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your study journey."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or phone number</Label>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? "identifier-error" : undefined}
          />
          {errors.identifier && (
            <p id="identifier-error" className="text-xs font-medium text-destructive">
              {errors.identifier}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-xs font-medium text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="remember" /> Remember me
          </label>
          <button type="button" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Logging in…" : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}
