"use client";

/**
 * TaskFlow — Shared badge components for status / priority / category.
 * Developed by Brijesh Mishra
 */

import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { Circle, CircleDashed, CircleDot, Flame, SignalLow, SignalHigh, Siren } from "lucide-react";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config: Record<TaskStatus, { className: string; icon: React.ReactNode }> = {
    TODO: {
      className: "bg-muted text-muted-foreground border-border",
      icon: <CircleDashed className="h-3 w-3" />,
    },
    IN_PROGRESS: {
      className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
      icon: <CircleDot className="h-3 w-3" />,
    },
    COMPLETED: {
      className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
      icon: <Circle className="h-3 w-3" />,
    },
  };
  const c = config[status];
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${c.className}`}>
      {c.icon}
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config: Record<TaskPriority, { className: string; icon: React.ReactNode }> = {
    LOW: {
      className: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
      icon: <SignalLow className="h-3 w-3" />,
    },
    MEDIUM: {
      className: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
      icon: <SignalHigh className="h-3 w-3" />,
    },
    HIGH: {
      className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900",
      icon: <Flame className="h-3 w-3" />,
    },
    URGENT: {
      className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
      icon: <Siren className="h-3 w-3" />,
    },
  };
  const c = config[priority];
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${c.className}`}>
      {c.icon}
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge variant="outline" className="gap-1 bg-background font-normal text-muted-foreground">
      {category}
    </Badge>
  );
}
