"use client";

/**
 * TaskFlow — Analytics dashboard (stats cards, charts, upcoming deadlines)
 * Data comes from GET /api/stats (server-side aggregation).
 * Developed by Brijesh Mishra
 */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge } from "@/components/taskflow/task-badges";
import { api } from "@/lib/api";
import type { Stats } from "@/lib/types";
import {
  AlarmClock,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  ListTodo,
} from "lucide-react";

interface DashboardViewProps {
  version: number;
}

const PRIORITY_CHART_COLORS = ["#059669", "#f59e0b", "#f97316", "#ef4444"];

export function DashboardView({ version }: DashboardViewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<Stats>("/api/stats");
        if (!cancelled) setStats(data);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load stats"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [version]);

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      className: "text-foreground",
    },
    {
      label: "To Do",
      value: stats.todo,
      icon: CircleDashed,
      className: "text-muted-foreground",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: CircleDot,
      className: "text-amber-500",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      className: "text-emerald-600",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlarmClock,
      className: "text-red-500",
    },
  ];

  const pieData = stats.priorityBreakdown
    .filter((slice) => slice.count > 0)
    .map((slice) => ({
      name: slice.priority,
      value: slice.count,
    }));

  return (
    <div className="space-y-4">
      {/* ---------- STAT CARDS ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                <card.icon className={`h-5 w-5 ${card.className}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---------- PROGRESS + CHARTS ---------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Completion Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="mb-2 flex items-end justify-between">
              <span className="text-4xl font-bold text-primary">
                {stats.completionRate}%
              </span>
              <span className="text-sm text-muted-foreground">
                {stats.completed} of {stats.total} tasks completed
              </span>
            </div>
            <Progress value={stats.completionRate} className="h-3" />
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-semibold">Priority Mix</h4>
              {stats.priorityBreakdown.map((slice, index) => (
                <div key={slice.priority} className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: PRIORITY_CHART_COLORS[index],
                    }}
                  />
                  <span className="flex-1 text-sm capitalize">
                    {slice.priority.toLowerCase()}
                  </span>
                  <span className="text-sm font-medium">{slice.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">7-Day Activity Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.weeklyTrend}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="completedFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="created"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#createdFill)"
                    name="Created"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#completedFill)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- PRIORITY DONUT + UPCOMING ---------- */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">
              Tasks by Priority (Donut)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {pieData.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                No tasks yet — create tasks to see the breakdown.
              </div>
            ) : (
              <div className="flex h-[220px] items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PRIORITY_CHART_COLORS[index % PRIORITY_CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {stats.upcoming.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing due — you are all caught up!
              </p>
            ) : (
              <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
                {stats.upcoming.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {task.title}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        Due{" "}
                        {new Date(task.dueDate as string).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
