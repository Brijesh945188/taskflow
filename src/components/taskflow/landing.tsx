"use client";

/**
 * TaskFlow — Landing page (marketing view for logged-out visitors)
 * Developed by Brijesh Mishra
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AuthDialog,
} from "@/components/taskflow/auth-dialog";
import { ThemeToggle } from "@/components/taskflow/theme-toggle";
import {
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  KanbanSquare,
  ListChecks,
  Moon,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
} from "lucide-react";
import type { PublicUser } from "@/lib/types";

interface LandingProps {
  onAuthed: (user: PublicUser) => void;
}

const FEATURES = [
  {
    icon: KanbanSquare,
    title: "Kanban Board",
    description:
      "Drag & drop tasks between To Do, In Progress and Completed columns with real-time optimistic updates.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Live stats, completion rate, priority breakdown and 7-day activity trend rendered with Recharts.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "JWT-based sessions stored in httpOnly cookies with bcrypt password hashing — industry standard security.",
  },
  {
    icon: ListChecks,
    title: "Powerful Task Management",
    description:
      "Full CRUD operations with priorities, categories, due dates and completion tracking for every task.",
  },
  {
    icon: Search,
    title: "Search & Filters",
    description:
      "Instantly filter tasks by status, priority or keyword across board and list views.",
  },
  {
    icon: Moon,
    title: "Dark Mode & Responsive",
    description:
      "Beautiful light/dark themes and a mobile-first layout that works on every screen size.",
  },
];

const STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "shadcn/ui",
  "Prisma ORM",
  "SQLite",
  "JWT Auth",
  "Recharts",
  "dnd-kit",
];

export function Landing({ onAuthed }: LandingProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"login" | "register">("login");

  const openAuth = (tab: "login" | "register") => {
    setDefaultTab(tab);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ---------- HEADER ---------- */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" onClick={() => openAuth("login")}>
              Sign In
            </Button>
            <Button onClick={() => openAuth("register")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]"
          />
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 text-center">
            <Badge variant="outline" className="mb-6 gap-1.5 px-3 py-1 text-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Full-Stack Task Management System
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
              Organize your work.
              <span className="block text-primary">Boost your productivity.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              TaskFlow is a complete full-stack application — secure JWT
              authentication, a drag & drop Kanban board, analytics dashboard
              and REST API built with Next.js 16, Prisma and TypeScript.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => openAuth("register")}>
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => openAuth("login")}>
                Sign In
              </Button>
            </div>

            {/* Tech stack chips */}
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2">
              {STACK.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-medium"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to stay on track
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                A production-ready feature set built with a modern, type-safe
                technology stack.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <Card
                  key={feature.title}
                  className="group transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                      <feature.icon className="h-5.5 w-5.5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- ARCHITECTURE SNAPSHOT ---------- */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <Badge variant="outline" className="mb-4 gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  Built like a production app
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                  A real REST API. A real database. Zero shortcuts.
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Every feature is powered by proper backend engineering —
                  validated requests (Zod), hashed passwords (bcrypt), signed
                  session tokens (JWT) and a relational schema managed by
                  Prisma with ownership checks on every query.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "8 REST endpoints with input validation & typed responses",
                    "Prisma models with cascade deletes and indexed lookups",
                    "Optimistic UI updates with automatic rollback on failure",
                    "Aggregated dashboard stats computed server-side",
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: Database,
                    title: "Prisma + SQLite",
                    text: "Type-safe database layer with migrations and seeding support.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "JWT + bcrypt",
                    text: "httpOnly cookie sessions with 7-day expiry and secure hashing.",
                  },
                  {
                    icon: Palette,
                    title: "shadcn/ui",
                    text: "Accessible component library styled with Tailwind CSS 4.",
                  },
                  {
                    icon: Smartphone,
                    title: "Responsive",
                    text: "Mobile-first design, 44px touch targets, safe-area aware footer.",
                  },
                ].map((item) => (
                  <Card key={item.title}>
                    <CardContent className="p-5">
                      <item.icon className="mb-3 h-6 w-6 text-primary" />
                      <h3 className="mb-1 font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer className="mt-auto border-t bg-muted/40 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          <p>
            Developed by{" "}
            <span className="font-semibold text-foreground">
              Brijesh Mishra
            </span>
          </p>
        </div>
      </footer>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthed={onAuthed}
        defaultTab={defaultTab}
      />
    </div>
  );
}
