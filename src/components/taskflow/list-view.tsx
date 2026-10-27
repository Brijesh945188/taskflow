"use client";

/**
 * TaskFlow — List view with search, filters, sorting and row actions.
 * Developed by Brijesh Mishra
 */

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/taskflow/task-badges";
import { TaskDialog } from "@/components/taskflow/task-dialog";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Download,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

interface ListViewProps {
  tasks: Task[];
  loading: boolean;
  onCreateTask: (input: TaskInput) => Promise<unknown>;
  onUpdateTask: (id: string, patch: Partial<TaskInput>) => Promise<unknown>;
  onDeleteTask: (task: Task) => void;
  onLoadSample: () => void;
}

type SortKey = "createdAt" | "dueDate" | "priority";

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "COMPLETED") return false;
  return new Date(task.dueDate) < new Date();
}

export function ListView({
  tasks,
  loading,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onLoadSample,
}: ListViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = tasks.filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter)
        return false;
      if (query) {
        const haystack =
          `${task.title} ${task.description ?? ""} ${task.category ?? ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "createdAt") {
        cmp =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === "dueDate") {
        const av = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bv = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = av - bv;
      } else {
        cmp =
          PRIORITY_ORDER[a.priority as TaskPriority] -
          PRIORITY_ORDER[b.priority as TaskPriority];
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, sortKey, sortDir]);

  const openCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const exportCSV = () => {
    if (tasks.length === 0) {
      toast.error("No tasks available to export.");
      return;
    }
    const headers = [
      "Task ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Category",
      "Due Date",
      "Created Date",
    ];
    const rows = tasks.map((t) => [
      `"${t.id}"`,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.category || "General"}"`,
      `"${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"}"`,
      `"${new Date(t.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `TaskFlow_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Tasks exported to CSV successfully!");
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const cycleStatus = (task: Task) => {
    const order: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];
    const next = order[(order.indexOf(task.status as TaskStatus) + 1) % 3];
    onUpdateTask(task.id, { status: next });
  };

  const renderSortButton = (label: string, keyName: SortKey) => (
    <button
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => {
        if (sortKey === keyName) {
          setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
          setSortKey(keyName);
          setSortDir("desc");
        }
      }}
    >
      {label}
      {sortKey === keyName ? (
        sortDir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : null}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* ---------- FILTER BAR ---------- */}
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/40 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title, description or category…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {TASK_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              {TASK_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={exportCSV}
            className="gap-1.5"
            title="Export tasks to CSV spreadsheet"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={openCreate} className="ml-auto">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* ---------- TASK ROWS ---------- */}
      <div className="overflow-hidden rounded-xl border">
        <div className="hidden grid-cols-[1fr_150px_130px_120px_90px] gap-4 border-b bg-muted/60 px-4 py-3 sm:grid">
          {renderSortButton("Task", "createdAt")}
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Status
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Priority
          </span>
          {renderSortButton("Due Date", "dueDate")}
          <span className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Actions
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <ListFilter className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0
                ? "No tasks yet. Create your first task or load the sample dataset."
                : "No tasks match your filters. Try clearing the search or filters."}
            </p>
            {tasks.length === 0 && (
              <Button variant="outline" onClick={onLoadSample}>
                Load Sample Tasks
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((task) => {
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  className="grid gap-3 px-4 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_150px_130px_120px_90px] sm:items-center sm:gap-4"
                >
                  <div className="min-w-0">
                    <button
                      className="text-left text-sm font-medium leading-snug hover:underline"
                      onClick={() => cycleStatus(task)}
                      title="Click to advance status"
                    >
                      {task.title}
                    </button>
                    {task.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {task.category && (
                        <CategoryBadge category={task.category} />
                      )}
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={task.status as TaskStatus} />
                  </div>
                  <div>
                    <PriorityBadge priority={task.priority as TaskPriority} />
                  </div>
                  <div>
                    {task.dueDate ? (
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          overdue
                            ? "font-semibold text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        <CalendarDays className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Edit ${task.title}`}
                      onClick={() => openEdit(task)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => setDeleteTarget(task)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {tasks.length} tasks
      </p>

      {/* ---------- DIALOGS ---------- */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(input) =>
          editingTask
            ? onUpdateTask(editingTask.id, input)
            : onCreateTask(input)
        }
        editingTask={editingTask}
      />

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
                if (deleteTarget) onDeleteTask(deleteTarget);
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
