"use client";

/**
 * TaskFlow — Authentication dialog (Login / Register)
 * Developed by Brijesh Mishra
 */

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import type { PublicUser } from "@/lib/types";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthed: (user: PublicUser) => void;
  defaultTab?: "login" | "register";
}

interface AuthFormState {
  name: string;
  email: string;
  password: string;
}

export function AuthDialog({
  open,
  onOpenChange,
  onAuthed,
  defaultTab = "login",
}: AuthDialogProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [form, setForm] = useState<AuthFormState>({
    name: "",
    email: defaultTab === "login" ? "brijesh@taskflow.dev" : "",
    password: defaultTab === "login" ? "password123" : "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: keyof AuthFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validate = (mode: "login" | "register"): string | null => {
    if (mode === "register" && form.name.trim().length < 2) {
      return "Please enter your full name (min 2 characters).";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }
    if (mode === "register" && form.password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (form.password.length === 0) {
      return "Password is required.";
    }
    return null;
  };

  const handleSubmit = async (mode: "login" | "register") => {
    const validationError = validate(mode);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: form.email.trim(), password: form.password }
          : {
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
            };

      const data = await api<{ user: PublicUser }>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success(
        mode === "login"
          ? `Welcome back, ${data.user.name}!`
          : `Account created. Welcome, ${data.user.name}!`
      );
      onAuthed(data.user);
      onOpenChange(false);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to TaskFlow</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to start managing your
            tasks.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "login" | "register");
            setError(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>

          {/* ---------- LOGIN ---------- */}
          <TabsContent value="login" className="space-y-4 pt-2">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-medium text-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Demo Account Credentials
                </span>
                <button
                  type="button"
                  className="text-primary hover:underline font-semibold cursor-pointer text-xs"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      email: "brijesh@taskflow.dev",
                      password: "password123",
                    }));
                    setError(null);
                  }}
                >
                  Auto-fill
                </button>
              </div>
              <div className="text-muted-foreground font-mono flex flex-col gap-0.5 sm:flex-row sm:gap-4">
                <span>Email: <strong className="text-foreground font-semibold">brijesh@taskflow.dev</strong></span>
                <span>Password: <strong className="text-foreground font-semibold">password123</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !submitting && handleSubmit("login")
                }
              />
            </div>
            {error && tab === "login" && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              className="w-full"
              disabled={submitting}
              onClick={() => handleSubmit("login")}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign In
            </Button>
          </TabsContent>

          {/* ---------- REGISTER ---------- */}
          <TabsContent value="register" className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="register-name">Full Name</Label>
              <Input
                id="register-name"
                placeholder="Brijesh Mishra"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !submitting &&
                  handleSubmit("register")
                }
              />
            </div>
            {error && tab === "register" && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              className="w-full"
              disabled={submitting}
              onClick={() => handleSubmit("register")}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Create Account
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
