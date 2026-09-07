"use client";

import type { Task } from "@/types/task";
import { TaskListItem } from "@/components/task/TaskListItem";
import { EmptyState } from "@/components/feedback/EmptyState";

interface DayTaskListProps {
  date: string;
  tasks: Task[];
}

/**
 * カレンダーで選択した日のタスク一覧（F-08）。
 * startTime の昇順、時刻なしは後ろ。アーカイブ・ごみ箱は除外する。
 */
export function DayTaskList({ date, tasks }: DayTaskListProps) {
  const dayTasks = tasks
    .filter((t) => t.status === "active" && t.dueDate === date)
    .sort((a, b) => {
      if (a.startTime === null && b.startTime !== null) return 1;
      if (a.startTime !== null && b.startTime === null) return -1;
      if (a.startTime !== null && b.startTime !== null && a.startTime !== b.startTime) {
        return a.startTime < b.startTime ? -1 : 1;
      }
      return 0;
    });

  if (dayTasks.length === 0) {
    return <EmptyState message="この日の予定はありません" />;
  }

  return (
    <div>
      {dayTasks.map((task) => (
        <TaskListItem key={task.id} task={task} variant="readonly" />
      ))}
    </div>
  );
}
