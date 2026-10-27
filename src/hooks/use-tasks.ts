"use client";

/**
 * TaskFlow — useTasks hook
 * Client-side task state management with optimistic updates.
 * Developed by Brijesh Mishra
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Task, TaskInput, TaskStatus } from "@/lib/types";

export function useTasks(onUnauthorized?: () => void) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0); // bumped after every mutation

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      const message =
        error instanceof Error ? error.message : fallback;
      toast.error(message);
      if (message === "Unauthorized") onUnauthorized?.();
    },
    [onUnauthorized]
  );

  const load = useCallback(async () => {
    try {
      const data = await api<{ tasks: Task[] }>("/api/tasks");
      setTasks(data.tasks);
    } catch (error) {
      handleError(error, "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = useCallback(
    async (input: TaskInput) => {
      const data = await api<{ task: Task }>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setTasks((prev) => [data.task, ...prev]);
      setVersion((v) => v + 1);
      toast.success("Task created successfully");
      return data.task;
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<TaskInput> & { position?: number }) => {
      // Optimistic update for snappy UI.
      const previous = tasks;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
      try {
        const data = await api<{ task: Task }>(`/api/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
        setVersion((v) => v + 1);
        return data.task;
      } catch (error) {
        setTasks(previous); // rollback
        handleError(error, "Failed to update task");
        throw error;
      }
    },
    [tasks, handleError]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const previous = tasks;
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setVersion((v) => v + 1);
      try {
        await api(`/api/tasks/${id}`, { method: "DELETE" });
        toast.success("Task deleted");
      } catch (error) {
        setTasks(previous); // rollback
        handleError(error, "Failed to delete task");
      }
    },
    [tasks, handleError]
  );

  const moveTask = useCallback(
    async (id: string, status: TaskStatus) => {
      const task = tasks.find((t) => t.id === id);
      if (!task || task.status === status) return;
      const previous = tasks;
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
      try {
        const data = await api<{ task: Task }>(`/api/tasks/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status }),
        });
        setTasks((prev) => prev.map((t) => (t.id === id ? data.task : t)));
        setVersion((v) => v + 1);
      } catch (error) {
        setTasks(previous); // rollback
        handleError(error, "Failed to move task");
      }
    },
    [tasks, handleError]
  );

  const loadSampleData = useCallback(async () => {
    try {
      const data = await api<{ created: number }>("/api/sample-data", {
        method: "POST",
      });
      toast.success(`${data.created} sample tasks added`);
      await load();
      setVersion((v) => v + 1);
    } catch (error) {
      handleError(error, "Failed to load sample data");
    }
  }, [load, handleError]);

  return {
    tasks,
    loading,
    version,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    loadSampleData,
    refresh: load,
  };
}
