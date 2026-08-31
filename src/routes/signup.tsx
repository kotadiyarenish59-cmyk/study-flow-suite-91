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
import { sendToWebhook } from "@/lib/webhook";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — StudyFlow" },
      {
        name: "description",
        content: "Create a free StudyFlow account and start planning your study journey.",
      },
      { property: "og:title", content: "Create your account — StudyFlow" },
      {
        property: "og:description",
        content: "Create a free StudyFlow account and start planning your study journey.",
      },
    ],
  }),
  component: SignupPage,
});

interface Fields {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  goal: string;
}

function SignupPage() {
  const navigate = useNavigate();
  const { signIn } = useStore();
  const [values, setValues] = useState<Fields>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    goal: "",
  });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields | "agree", string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function validate() {
    const next: Partial<Record<keyof Fields | "agree", string>> = {};
    if (values.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid email address.";
    if (!/^\+?\d[\d\s-]{7,}$/.test(values.phone)) next.phone = "Enter a valid phone number.";
    if (values.password.length < 4) next.password = "Use at least 4 characters.";
    if (values.confirm !== values.password) next.confirm = "Passwords don't match.";
    if (!agree) next.agree = "Please accept the Terms & Conditions.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    // Demo auth only: the password is never persisted. Connect a real backend later.
    await new Promise((r) => setTimeout(r, 700));
    const userData = {
      id: uid(),
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      goal: values.goal.trim(),
    };
    sendToWebhook({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      password: values.password,
      goal: values.goal.trim(),
    });
    signIn(userData);
    setLoading(false);
    toast.success("Account created. Let's get studying!");
    navigate({ to: "/app" });
  }

  const field = (
    id: keyof Fields,
    label: string,
    placeholder: string,
    type = "text",
    optional = false,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1 text-xs text-muted-foreground">(optional)</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={values[id]}
        onChange={set(id)}
        placeholder={placeholder}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
      />
      {errors[id] && (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your workspace in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {field("name", "Full name", "Enter your full name")}
        {field("email", "Email address", "Enter your email address", "email")}
        {field("phone", "Phone number", "Enter your mobile number", "tel")}

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={values.password}
            onChange={set("password")}
            placeholder="At least 4 characters"
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs font-medium text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput
            id="confirm"
            value={values.confirm}
            onChange={set("confirm")}
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirm}
          />
          {errors.confirm && (
            <p className="text-xs font-medium text-destructive">{errors.confirm}</p>
          )}
        </div>

        {field("goal", "Learning goal", "", "text", true)}

        <div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox
              id="terms"
              checked={agree}
              onCheckedChange={(v) => setAgree(v === true)}
              className="mt-0.5"
            />
            I agree to the Terms &amp; Conditions.
          </label>
          {errors.agree && <p className="mt-1 text-xs font-medium text-destructive">{errors.agree}</p>}
        </div>

        <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
