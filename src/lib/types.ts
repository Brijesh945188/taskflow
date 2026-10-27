/**
 * TaskFlow — Shared TypeScript types & constants
 * Used by both client components and API routes.
 * Developed by Brijesh Mishra
 */

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];
export const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: string | null;
  dueDate: string | null;
  position: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string | null;
  dueDate?: string | null;
}

export interface PrioritySlice {
  priority: TaskPriority;
  count: number;
}

export interface CategorySlice {
  category: string;
  count: number;
}

export interface TrendPoint {
  day: string;
  created: number;
  completed: number;
}

export interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  priorityBreakdown: PrioritySlice[];
  categoryBreakdown: CategorySlice[];
  weeklyTrend: TrendPoint[];
  upcoming: Task[];
}
