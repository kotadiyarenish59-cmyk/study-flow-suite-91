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
  const { signup } = useStore();
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

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleAgreeChange = (v: boolean) => {
    setAgree(v);
    if (errors.agree && v) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.agree;
        return next;
      });
    }
  };

  function validate() {
    const next: Partial<Record<keyof Fields | "agree", string>> = {};

    // 1. Full Name (Compulsory)
    const trimmedName = values.name.trim();
    if (!trimmedName) {
      next.name = "Full name is compulsory.";
    } else if (trimmedName.length < 2) {
      next.name = "Full name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s'.]+$/.test(trimmedName)) {
      next.name = "Name should contain only valid letters.";
    }

    // 2. Email Address (Compulsory)
    const trimmedEmail = values.email.trim();
    if (!trimmedEmail) {
      next.email = "Email address is compulsory.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      next.email = "Please enter a valid email address (e.g. name@example.com).";
    }

    // 3. Phone Number (Compulsory)
    const cleanPhone = values.phone.replace(/[\s-]/g, "");
    if (!values.phone.trim()) {
      next.phone = "Phone number is compulsory.";
    } else if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      next.phone = "Please enter a valid 10-digit mobile number.";
    }

    // 4. Password (Compulsory)
    if (!values.password) {
      next.password = "Password is compulsory.";
    } else if (values.password.length < 4) {
      next.password = "Password must be at least 4 characters.";
    }

    // 5. Confirm Password (Compulsory)
    if (!values.confirm) {
      next.confirm = "Confirm password is compulsory.";
    } else if (values.confirm !== values.password) {
      next.confirm = "Passwords do not match.";
    }

    // 6. Terms & Conditions (Compulsory)
    if (!agree) {
      next.agree = "You must accept the Terms & Conditions to proceed.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fill in all compulsory fields correctly.");
    }
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      await signup({
        email: values.email.trim(),
        password: values.password,
        full_name: values.name.trim(),
      });

      sendToWebhook({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        goal: values.goal.trim(),
      });

      toast.success("Account created successfully. Welcome to StudyFlow!");
      navigate({ to: "/app" });
    } catch (err: any) {
      toast.error(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = (
    id: keyof Fields,
    label: string,
    placeholder: string,
    type = "text",
    optional = false,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs font-semibold text-foreground flex items-center justify-between">
        <span className="flex items-center gap-1">
          {label}
          {!optional && <span className="text-destructive font-bold text-sm" title="Compulsory">*</span>}
        </span>
        {optional && <span className="text-[11px] font-normal text-muted-foreground">(optional)</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={values[id]}
        onChange={set(id)}
        placeholder={placeholder}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `${id}-error` : undefined}
        className={errors[id] ? "border-destructive focus-visible:ring-destructive" : ""}
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
        {field("phone", "Phone number", "Enter 10-digit mobile number", "tel")}

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold text-foreground flex items-center gap-1">
            Password <span className="text-destructive font-bold text-sm" title="Compulsory">*</span>
          </Label>
          <PasswordInput
            id="password"
            value={values.password}
            onChange={set("password")}
            placeholder="At least 4 characters"
            aria-invalid={!!errors.password}
            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.password && (
            <p className="text-xs font-medium text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm" className="text-xs font-semibold text-foreground flex items-center gap-1">
            Confirm password <span className="text-destructive font-bold text-sm" title="Compulsory">*</span>
          </Label>
          <PasswordInput
            id="confirm"
            value={values.confirm}
            onChange={set("confirm")}
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirm}
            className={errors.confirm ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.confirm && (
            <p className="text-xs font-medium text-destructive">{errors.confirm}</p>
          )}
        </div>

        {field("goal", "Learning goal", "e.g. Master Python, Crack DSA", "text", true)}

        <div className="pt-1">
          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox
              id="terms"
              checked={agree}
              onCheckedChange={(v) => handleAgreeChange(v === true)}
              className="mt-0.5"
            />
            <span>
              I agree to the Terms &amp; Conditions <span className="text-destructive font-bold" title="Compulsory">*</span>
            </span>
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
