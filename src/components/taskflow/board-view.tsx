"use client";

/**
 * TaskFlow — Kanban board with drag & drop columns (dnd-kit)
 * Developed by Brijesh Mishra
 */

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskCard, TaskCardContent } from "@/components/taskflow/task-card";
import { TaskDialog } from "@/components/taskflow/task-dialog";
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type Task,
  type TaskInput,
  type TaskStatus,
} from "@/lib/types";
import { CircleDot, Circle, CircleDashed, Inbox, Plus, Sparkles } from "lucide-react";

interface BoardViewProps {
  tasks: Task[];
  loading: boolean;
  onCreateTask: (input: TaskInput) => Promise<unknown>;
  onUpdateTask: (id: string, patch: Partial<TaskInput>) => Promise<unknown>;
  onDeleteTask: (task: Task) => void;
  onLoadSample: () => void;
}

const COLUMN_ICONS: Record<TaskStatus, React.ReactNode> = {
  TODO: <CircleDashed className="h-4 w-4" />,
  IN_PROGRESS: <CircleDot className="h-4 w-4" />,
  COMPLETED: <Circle className="h-4 w-4" />,
};

function Column({
  status,
  tasks,
  onAdd,
  onEdit,
  onDelete,
}: {
  status: TaskStatus;
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[320px] flex-col rounded-xl border bg-muted/40 transition-colors ${
        isOver ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-primary">{COLUMN_ICONS[status]}</span>
          {STATUS_LABELS[status]}
          <Badge variant="secondary" className="ml-1">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label={`Add task to ${STATUS_LABELS[status]}`}
          onClick={() => onAdd(status)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-3">
        {tasks.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
            <Inbox className="h-6 w-6" />
            <p className="text-xs">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function BoardView({
  tasks,
  loading,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onLoadSample,
}: BoardViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [presetStatus, setPresetStatus] = useState<TaskStatus>("TODO");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      COMPLETED: [],
    };
    for (const task of tasks) {
      if (map[task.status as TaskStatus]) {
        map[task.status as TaskStatus].push(task);
      }
    }
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id) ?? null;
    setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.status === newStatus) return;
    await onUpdateTask(task.id, { status: newStatus });
  };

  const openCreate = (status: TaskStatus) => {
    setEditingTask(null);
    setPresetStatus(status);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-xl border p-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={byStatus[status]}
              onAdd={openCreate}
              onEdit={openEdit}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-[280px] rotate-2 opacity-90">
              <TaskCardContent
                task={activeTask}
                onEdit={() => undefined}
                onDelete={() => undefined}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {tasks.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-semibold">Your board is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first task or load a sample dataset to explore the
              app.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => openCreate("TODO")}>
              <Plus className="h-4 w-4" />
              New Task
            </Button>
            <Button variant="outline" onClick={onLoadSample}>
              <Sparkles className="h-4 w-4" />
              Load Sample Tasks
            </Button>
          </div>
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={(input) =>
          editingTask
            ? onUpdateTask(editingTask.id, input)
            : onCreateTask(input)
        }
        editingTask={editingTask}
        presetStatus={presetStatus}
      />
    </div>
  );
}
