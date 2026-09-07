/**
 * 優先度。要件 5.1.2 に定める3段階。
 */
export type Priority = "high" | "medium" | "low";

/**
 * タスクの状態。要件 5.1.3 に定める。
 * 「未完了」と「完了済み」の区別は status ではなく completedAt が担う。
 */
export type TaskStatus = "active" | "archived" | "trashed";

/**
 * タスク1件。
 * 予定（人との約束）も同じ型で表現し、startTime に値が入るものを予定として扱う。
 */
export interface Task {
  id: string;
  title: string;
  memo: string;
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  priority: Priority;
  category: string | null;
  status: TaskStatus;
  completedAt: string | null;
  archivedAt: string | null;
  trashedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * localStorage に保存する最上位の構造。
 * tasks の配列順は表示順を意味しない。表示順は要件 F-06 の規則で毎回算出する。
 */
export interface TaskAppData {
  schemaVersion: number;
  tasks: Task[];
}

/**
 * 現在のスキーマバージョン。
 * Task の構造を変更したときに 1 ずつ増やす。要件 F-14 で使用する。
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * localStorage のキー名。
 */
export const STORAGE_KEY = "task-app-data";

/**
 * 入力の文字数上限。要件 6.4。
 * 数え方は Array.from(str).length によるコードポイント単位とする。
 */
export const MAX_LENGTH = {
  title: 100,
  memo: 1000,
  category: 20,
} as const;

/**
 * タスク追加画面で使う入力値。id・状態系フィールドを持たない。
 */
export interface NewTaskInput {
  title: string;
  memo: string;
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  priority: Priority;
  category: string | null;
}

/**
 * 新規タスク作成時の初期値。要件 F-01、O-05。
 */
export const DEFAULT_TASK_VALUES: Omit<NewTaskInput, "title"> = {
  memo: "",
  dueDate: null,
  startTime: null,
  endTime: null,
  priority: "medium",
  category: null,
};
