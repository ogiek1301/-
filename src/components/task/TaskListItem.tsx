"use client";

import Link from "next/link";
import type { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/Checkbox";

export type TaskListItemVariant = "active" | "archived" | "trashed" | "readonly";

interface TaskListItemProps {
  task: Task;
  variant: TaskListItemVariant;
  onToggleComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onPurge?: (id: string) => void;
}

const PRIORITY_LABEL: Record<Task["priority"], string> = { high: "高", medium: "中", low: "低" };
const PRIORITY_COLOR: Record<Task["priority"], string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-gray-500",
};

function formatTime(task: Task): string | null {
  if (!task.startTime) return null;
  return task.endTime ? `${task.startTime}-${task.endTime}` : task.startTime;
}

/**
 * S-01 の4状態と S-02 の日別一覧から呼ばれる。variant によって表示する操作を出し分ける
 * （設計書 3.3節）。表示要素（タイトル・期日・優先度など）は共通。
 */
export function TaskListItem({
  task,
  variant,
  onToggleComplete,
  onDelete,
  onRestore,
  onPurge,
}: TaskListItemProps) {
  const isCompleted = task.status === "active" && task.completedAt !== null;
  const time = formatTime(task);

  const body = (
    <div className="min-w-0 flex-1">
      <p className={`truncate text-base ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>
        {task.title}
      </p>
      <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-gray-500">
        {task.dueDate && <span>{task.dueDate}</span>}
        {time && <span>{time}</span>}
        <span className={PRIORITY_COLOR[task.priority]}>優先度: {PRIORITY_LABEL[task.priority]}</span>
        {task.category && <span>#{task.category}</span>}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-3">
      {variant === "active" && (
        <Checkbox
          checked={isCompleted}
          onChange={() => onToggleComplete?.(task.id)}
          ariaLabel={isCompleted ? "未完了に戻す" : "完了にする"}
        />
      )}

      {variant === "readonly" ? (
        <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
          {body}
        </Link>
      ) : variant === "active" ? (
        <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
          {body}
        </Link>
      ) : (
        body
      )}

      {variant === "active" && (
        <button
          type="button"
          aria-label="削除"
          onClick={() => onDelete?.(task.id)}
          className="shrink-0 rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-gray-100 hover:text-red-600"
        >
          削除
        </button>
      )}

      {variant === "archived" && (
        <button
          type="button"
          onClick={() => onRestore?.(task.id)}
          className="shrink-0 rounded-lg px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          戻す
        </button>
      )}

      {variant === "trashed" && (
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onRestore?.(task.id)}
            className="rounded-lg px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            復元
          </button>
          <button
            type="button"
            onClick={() => onPurge?.(task.id)}
            className="rounded-lg px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            完全に削除
          </button>
        </div>
      )}
    </div>
  );
}

export function TaskListItemSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 border-b border-gray-100 py-3">
      <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}
