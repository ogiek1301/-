"use client";

import type { Task } from "@/types/task";
import { TaskListItem, TaskListItemSkeleton, type TaskListItemVariant } from "@/components/task/TaskListItem";
import { EmptyState } from "@/components/feedback/EmptyState";

interface TaskListProps {
  tasks: Task[];
  variant: TaskListItemVariant;
  isLoading: boolean;
  emptyMessage: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPurge?: (id: string) => void;
}

/**
 * 並び替えロジックを持たず、渡された tasks をそのまま描画するだけの責務を持つ
 * （design.md 3.3節）。並び替えは呼び出し元が src/lib/sort.ts の関数で行う。
 */
export function TaskList({
  tasks,
  variant,
  isLoading,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  onToggleComplete,
  onDelete,
  onRestore,
  onPurge,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <TaskListItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState message={emptyMessage} actionLabel={emptyActionLabel} onAction={onEmptyAction} />;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          variant={variant}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onRestore={onRestore}
          onPurge={onPurge}
        />
      ))}
    </div>
  );
}
