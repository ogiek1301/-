"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { TaskTabs, type PeriodTab, type StatusTab } from "@/components/task/TaskTabs";
import { CategoryFilter } from "@/components/task/CategoryFilter";
import { TaskList } from "@/components/task/TaskList";
import { ErrorState } from "@/components/feedback/ErrorState";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { TextField } from "@/components/ui/TextField";
import { GeneratePromptButton } from "@/components/gemini/GeneratePromptButton";
import { sortActiveTasks, sortArchivedTasks, sortTrashedTasks, filterTodayTasks } from "@/lib/sort";
import { getAvailableCategoryFilters } from "@/lib/categories";
import { todayJst, toJstDate } from "@/lib/dates";
import { StorageParseError } from "@/lib/storage";

/** S-01 タスク一覧。 */
export default function HomePage() {
  const router = useRouter();
  const {
    tasks,
    isLoading,
    loadError,
    lastActionError,
    completeTask,
    uncompleteTask,
    trashTask,
    restoreTask,
    purgeTask,
    archiveOverdueTasks,
    dismissActionError,
    clearAllTasks,
  } = useTasks();

  const [period, setPeriod] = useState<PeriodTab>("today");
  const [status, setStatus] = useState<StatusTab>("active");
  const [category, setCategory] = useState<string | null>(null);
  const [purgeTargetId, setPurgeTargetId] = useState<string | null>(null);
  const [showInitConfirm, setShowInitConfirm] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const hasArchivedRef = useRef(false);
  useEffect(() => {
    if (!isLoading && !hasArchivedRef.current) {
      hasArchivedRef.current = true;
      archiveOverdueTasks();
    }
  }, [isLoading, archiveOverdueTasks]);

  const handleStatusChange = (next: StatusTab) => {
    setStatus(next);
    setCategory(null);
  };

  if (loadError) {
    const isParseError = loadError instanceof StorageParseError;
    return (
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <ErrorState
          variant="full"
          message={
            isParseError
              ? "保存データを読み込めませんでした"
              : "このアプリのバージョンでは読み込めないデータです"
          }
          actionLabel={isParseError ? "データを初期化する" : undefined}
          onAction={isParseError ? () => setShowInitConfirm(true) : undefined}
        />
        {showInitConfirm && (
          <ConfirmDialog
            title="データを初期化する"
            message="保存されているすべてのデータを削除します。この操作は取り消せません。"
            confirmLabel="初期化する"
            onConfirm={() => {
              clearAllTasks();
              setShowInitConfirm(false);
            }}
            onCancel={() => setShowInitConfirm(false)}
          />
        )}
      </div>
    );
  }

  const categories = getAvailableCategoryFilters(tasks);
  const today = todayJst();

  let displayTasks = tasks;
  let emptyMessage = "";
  let emptyActionLabel: string | undefined;
  let onEmptyAction: (() => void) | undefined;
  let variant: "active" | "archived" | "trashed" = "active";

  if (status === "active") {
    variant = "active";
    const totalActive = sortActiveTasks(tasks);
    const categoryFiltered =
      category !== null ? sortActiveTasks(tasks.filter((t) => t.category === category)) : totalActive;
    const periodFiltered =
      period === "today" ? filterTodayTasks(categoryFiltered, today, toJstDate) : categoryFiltered;

    displayTasks = periodFiltered;

    if (totalActive.length === 0) {
      emptyMessage = "タスクがありません";
      emptyActionLabel = "タスクを追加";
      onEmptyAction = () => router.push("/tasks/new");
    } else if (category !== null && categoryFiltered.length === 0) {
      emptyMessage = "該当するタスクがありません";
      emptyActionLabel = "絞り込みを解除";
      onEmptyAction = () => setCategory(null);
    } else if (period === "today" && periodFiltered.length === 0) {
      emptyMessage = "今日のタスクはありません";
      emptyActionLabel = "全体タブを表示";
      onEmptyAction = () => setPeriod("all");
    }
  } else if (status === "archived") {
    variant = "archived";
    displayTasks = sortArchivedTasks(tasks.filter((t) => t.status === "archived"));
    emptyMessage = "アーカイブされたタスクはありません";
  } else {
    variant = "trashed";
    displayTasks = sortTrashedTasks(tasks.filter((t) => t.status === "trashed"));
    emptyMessage = "ごみ箱は空です";
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-lg font-semibold text-gray-900">タスク</h1>

      {lastActionError && (
        <ErrorState
          variant="inline"
          message="保存できませんでした。ブラウザの保存容量が上限に達しています"
          onDismiss={dismissActionError}
        />
      )}

      <TaskTabs period={period} onPeriodChange={setPeriod} status={status} onStatusChange={handleStatusChange} />

      {status === "active" && categories.length > 0 && (
        <CategoryFilter categories={categories} selected={category} onChange={setCategory} />
      )}

      <TaskList
        tasks={displayTasks}
        variant={variant}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyActionLabel={emptyActionLabel}
        onEmptyAction={onEmptyAction}
        onToggleComplete={(id) => {
          const task = tasks.find((t) => t.id === id);
          if (!task) return;
          if (task.completedAt !== null) {
            uncompleteTask(id);
          } else {
            completeTask(id);
          }
        }}
        onDelete={(id) => trashTask(id)}
        onRestore={(id) => restoreTask(id)}
        onPurge={(id) => setPurgeTargetId(id)}
      />

      {purgeTargetId && (
        <ConfirmDialog
          title="完全に削除"
          message="このタスクを完全に削除します。この操作は取り消せません。"
          confirmLabel="削除する"
          onConfirm={() => {
            purgeTask(purgeTargetId);
            setPurgeTargetId(null);
          }}
          onCancel={() => setPurgeTargetId(null)}
        />
      )}

      <div className="mt-4 flex flex-col gap-4 border-t border-gray-200 pt-4">
        <GeneratePromptButton kind="calendar" tasks={tasks} />

        <div className="flex flex-col gap-2">
          <TextField
            label="貼り付けテキスト"
            value={pastedText}
            onChange={setPastedText}
            multiline
            placeholder="会話やメールの内容を貼り付け"
          />
          <GeneratePromptButton kind="organize" pastedText={pastedText} />
        </div>
      </div>
    </div>
  );
}
