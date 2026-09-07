"use client";

import { useCallback, useEffect, useState } from "react";
import type { NewTaskInput, Task } from "@/types/task";
import { generateId } from "@/lib/id";
import { nowIso, todayJst, toJstDate } from "@/lib/dates";
import {
  clearTasks,
  loadTasks,
  saveTasks,
  StorageParseError,
  StorageQuotaError,
  StorageVersionError,
} from "@/lib/storage";

/**
 * localStorage を扱うすべてのコンポーネントは、直接 src/lib/storage.ts を
 * import せず、このフックを経由する（設計書 4.4節）。
 */
export function useTasks() {
  // サーバー側の初回レンダリングと、クライアント側の初回レンダリング
  // （useEffect 実行前）は、必ずこの初期値で一致させる。ここで loadTasks() を
  // 直接呼んだり、useState の初期化関数の中で読んだりしてはならない
  // （設計書 2.1節・4.4節、ハイドレーション不一致の防止）。
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<StorageParseError | StorageVersionError | null>(
    null,
  );
  const [lastActionError, setLastActionError] = useState<StorageQuotaError | null>(null);

  useEffect(() => {
    // ここはブラウザ側でのみ実行される。localStorage への最初のアクセスはここで行う。
    // マウント後の同期的な読み込み結果を反映するための setState であり、
    // 外部システム（localStorage）との同期という useEffect 本来の用途に当たる。
    try {
      const loaded = loadTasks();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTasks(loaded);
    } catch (e) {
      if (e instanceof StorageParseError || e instanceof StorageVersionError) {
        setLoadError(e);
      } else {
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * tasks を更新して保存を試みる共通処理。
   * 失敗した場合は React の状態を呼び出し前に戻し、lastActionError を設定して
   * false を返す。成功時は true を返す（設計書 4.4節）。
   */
  const commit = useCallback((nextTasks: Task[]): boolean => {
    const previous = tasks;
    setTasks(nextTasks);
    try {
      saveTasks(nextTasks);
      return true;
    } catch (e) {
      if (e instanceof StorageQuotaError) {
        setTasks(previous);
        setLastActionError(e);
        return false;
      }
      throw e;
    }
  }, [tasks]);

  const addTask = useCallback(
    (input: NewTaskInput): boolean => {
      const now = nowIso();
      const newTask: Task = {
        id: generateId(),
        title: input.title.trim(),
        memo: input.memo,
        dueDate: input.dueDate,
        startTime: input.startTime,
        endTime: input.endTime,
        priority: input.priority,
        category: input.category?.trim() || null,
        status: "active",
        completedAt: null,
        archivedAt: null,
        trashedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      return commit([...tasks, newTask]);
    },
    [tasks, commit],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Task>): boolean => {
      const now = nowIso();
      const next = tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t));
      return commit(next);
    },
    [tasks, commit],
  );

  const completeTask = useCallback(
    (id: string): boolean => {
      const now = nowIso();
      return updateTask(id, { completedAt: now });
    },
    [updateTask],
  );

  const uncompleteTask = useCallback(
    (id: string): boolean => {
      return updateTask(id, { completedAt: null });
    },
    [updateTask],
  );

  const trashTask = useCallback(
    (id: string): boolean => {
      const now = nowIso();
      return updateTask(id, { status: "trashed", trashedAt: now });
    },
    [updateTask],
  );

  const restoreTask = useCallback(
    (id: string): boolean => {
      return updateTask(id, { status: "active", trashedAt: null, archivedAt: null });
    },
    [updateTask],
  );

  const purgeTask = useCallback(
    (id: string): boolean => {
      return commit(tasks.filter((t) => t.id !== id));
    },
    [tasks, commit],
  );

  /**
   * 起動時のアーカイブ判定（F-04）。
   * 完了済み（status="active" かつ completedAt あり）のタスクのうち、
   * completedAt の JST 日付が本日より前のものを archived に移す。
   */
  const archiveOverdueTasks = useCallback((): void => {
    const today = todayJst();
    const now = nowIso();
    let changed = false;
    const next = tasks.map((t) => {
      if (t.status === "active" && t.completedAt !== null) {
        const completedDate = toJstDate(t.completedAt);
        if (completedDate < today) {
          changed = true;
          return { ...t, status: "archived" as const, archivedAt: now, updatedAt: now };
        }
      }
      return t;
    });
    if (changed) {
      commit(next);
    }
  }, [tasks, commit]);

  const dismissActionError = useCallback((): void => {
    setLastActionError(null);
  }, []);

  /**
   * 保存データを完全に削除し、画面の状態を空に戻す（F-13 の初期化ボタン用）。
   * loadError（JSON 破損）を解消するための唯一の手段。
   */
  const clearAllTasks = useCallback((): void => {
    clearTasks();
    setTasks([]);
    setLoadError(null);
  }, []);

  return {
    tasks,
    isLoading,
    loadError,
    lastActionError,
    addTask,
    updateTask,
    completeTask,
    uncompleteTask,
    trashTask,
    restoreTask,
    purgeTask,
    archiveOverdueTasks,
    dismissActionError,
    clearAllTasks,
  };
}
