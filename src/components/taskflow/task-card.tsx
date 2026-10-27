"use client";

/**
 * TaskFlow — Kanban task card.
 * - TaskCardContent: pure presentational card (safe inside DragOverlay)
 * - TaskCard: draggable wrapper used on the board
 * Developed by Brijesh Mishra
 */

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CategoryBadge,
  PriorityBadge,
} from "@/components/taskflow/task-badges";
import {
  type Task,
  type TaskPriority,
} from "@/lib/types";
import { CalendarDays, GripVertical, Pencil, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "COMPLETED") return false;
  return new Date(task.dueDate) < new Date();
}

function dueDateLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year:
      date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/** Pure presentational card — contains NO dnd-kit hooks. */
export function TaskCardContent({ task, onEdit, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task);

  return (
    <Card className="border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h4
              className={`text-sm font-medium leading-snug ${
                task.status === "COMPLETED"
                  ? "text-muted-foreground line-through"
                  : ""
              }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <PriorityBadge priority={task.priority as TaskPriority} />
              {task.category && <CategoryBadge category={task.category} />}
            </div>

            {task.dueDate && (
              <p
                className={`mt-2 flex items-center gap-1 text-xs ${
                  overdue
                    ? "font-medium text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-3 w-3" />
                {overdue ? "Overdue: " : "Due: "}
                {dueDateLabel(task.dueDate)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            aria-label={`Edit ${task.title}`}
            onClick={() => onEdit(task)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            aria-label={`Delete ${task.title}`}
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Draggable board card. */
export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={`group mb-3 ${isDragging ? "z-50 opacity-80" : ""}`}
    >
      <div className="flex items-start">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Drag task ${task.title}`}
          className="mt-4 cursor-grab touch-none pl-1 pr-0.5 text-muted-foreground/40 transition-colors hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <TaskCardContent task={task} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}
