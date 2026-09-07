import type { Priority, Task } from "@/types/task";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function isCompleted(task: Task): boolean {
  return task.status === "active" && task.completedAt !== null;
}

export function isActiveIncomplete(task: Task): boolean {
  return task.status === "active" && task.completedAt === null;
}

/**
 * 「未完了」タブの並び順（要件 F-06 の規則1〜6）。
 * 1. 未完了タスクを先に、完了済みタスクを後に配置する
 * 2. 未完了タスクどうしは、期日の昇順に並べる
 * 3. 期日が同じ場合は、優先度の高い順に並べる
 * 4. 期日・優先度が同じ場合は、開始時刻の昇順に並べる。開始時刻なしは後ろ
 * 5. 期日を持たないタスクは、期日を持つタスクすべての後ろに置く
 * 6. 完了済みタスクどうしは、completedAt の降順に並べる
 */
export function sortActiveTasks(tasks: Task[]): Task[] {
  const incomplete = tasks.filter(isActiveIncomplete);
  const completed = tasks.filter(isCompleted);

  incomplete.sort((a, b) => {
    // 規則5: 期日なしは期日ありの後ろ
    if (a.dueDate === null && b.dueDate !== null) return 1;
    if (a.dueDate !== null && b.dueDate === null) return -1;
    if (a.dueDate !== null && b.dueDate !== null && a.dueDate !== b.dueDate) {
      return a.dueDate < b.dueDate ? -1 : 1;
    }
    // 規則3: 優先度
    if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    }
    // 規則4: 開始時刻。なしは後ろ
    if (a.startTime === null && b.startTime !== null) return 1;
    if (a.startTime !== null && b.startTime === null) return -1;
    if (a.startTime !== null && b.startTime !== null && a.startTime !== b.startTime) {
      return a.startTime < b.startTime ? -1 : 1;
    }
    return 0;
  });

  completed.sort((a, b) => {
    // 規則6: completedAt の降順
    const aAt = a.completedAt ?? "";
    const bAt = b.completedAt ?? "";
    return aAt < bAt ? 1 : aAt > bAt ? -1 : 0;
  });

  return [...incomplete, ...completed];
}

/** アーカイブタブ: archivedAt の降順（設計書 3章 / 要件 F-06）。全件表示、上限なし。 */
export function sortArchivedTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aAt = a.archivedAt ?? "";
    const bAt = b.archivedAt ?? "";
    return aAt < bAt ? 1 : aAt > bAt ? -1 : 0;
  });
}

/** ごみ箱タブ: trashedAt の降順（設計書 3章 / 要件 F-06）。全件表示、上限なし。 */
export function sortTrashedTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aAt = a.trashedAt ?? "";
    const bAt = b.trashedAt ?? "";
    return aAt < bAt ? 1 : aAt > bAt ? -1 : 0;
  });
}

/**
 * 「今日」タブの絞り込み（要件 F-06）。
 * (a) 未完了タスクのうち、dueDate が本日以前のもの
 * (b) 完了済みタスクのうち、completedAt(のJST日付) が本日のもの
 */
export function filterTodayTasks(tasks: Task[], today: string, completedAtToJstDate: (iso: string) => string): Task[] {
  return tasks.filter((task) => {
    if (isActiveIncomplete(task)) {
      return task.dueDate !== null && task.dueDate <= today;
    }
    if (isCompleted(task)) {
      return task.completedAt !== null && completedAtToJstDate(task.completedAt) === today;
    }
    return false;
  });
}
