"use client";

/**
 * TaskFlow — App shell: header, navigation tabs, view switching, footer.
 * Developed by Brijesh Mishra
 */

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BoardView,
} from "@/components/taskflow/board-view";
import { ListView } from "@/components/taskflow/list-view";
import { DashboardView } from "@/components/taskflow/dashboard-view";
import { ThemeToggle } from "@/components/taskflow/theme-toggle";
import { TaskDialog } from "@/components/taskflow/task-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { api } from "@/lib/api";
import type { PublicUser, Task, TaskInput } from "@/lib/types";
import {
  BarChart3,
  CheckCircle2,
  Columns3,
  List,
  LogOut,
  Plus,
} from "lucide-react";

interface AppShellProps {
  user: PublicUser;
  onLogout: () => void;
}

type View = "dashboard" | "board" | "list";

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "board", label: "Board", icon: <Columns3 className="h-4 w-4" /> },
  { id: "list", label: "List", icon: <List className="h-4 w-4" /> },
];

export function AppShell({ user, onLogout }: AppShellProps) {
  const [view, setView] = useState<View>("dashboard");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const {
    tasks,
    loading,
    version,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    loadSampleData,
  } = useTasks(onLogout);

  const handleCreate = async (input: TaskInput) => {
    await createTask(input);
  };

  const handleLogout = async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
      toast.success("Logged out. See you soon!");
    } catch {
      // even if the request fails, clear local state
    } finally {
      onLogout();
    }
  };

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---------- HEADER ---------- */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold tracking-tight">
                TaskFlow
              </span>
              <span className="hidden text-[11px] text-muted-foreground sm:block">
                Task Management System
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 rounded-lg bg-muted p-1 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                aria-current={view === item.id ? "page" : undefined}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === item.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              className="hidden sm:inline-flex"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Task
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none ring-primary focus-visible:ring-2"
                  aria-label="Open user menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                view === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </nav>
      </header>

      {/* ---------- CONTENT ---------- */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {view === "dashboard" && <DashboardView version={version} />}
        {view === "board" && (
          <BoardView
            tasks={tasks}
            loading={loading}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={(task) => setDeleteTarget(task)}
            onLoadSample={loadSampleData}
          />
        )}
        {view === "list" && (
          <ListView
            tasks={tasks}
            loading={loading}
            onCreateTask={createTask}
            onUpdateTask={updateTask}
            onDeleteTask={(task) => deleteTask(task.id)}
            onLoadSample={loadSampleData}
          />
        )}
      </main>

      {/* ---------- FOOTER (sticky bottom) ---------- */}
      <footer className="mt-auto border-t bg-muted/40 py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>TaskFlow — Full-Stack Task Management System</p>
          <p>
            Developed by{" "}
            <span className="font-semibold text-foreground">
              Brijesh Mishra
            </span>
          </p>
        </div>
      </footer>

      {/* ---------- GLOBAL CREATE DIALOG ---------- */}
      <TaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      {/* ---------- GLOBAL DELETE CONFIRM (board) ---------- */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget &&
                `"${deleteTarget.title}" will be permanently removed. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteTask(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
