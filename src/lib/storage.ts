import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_TASK_VALUES,
  STORAGE_KEY,
  type Task,
  type TaskAppData,
} from "@/types/task";
import { generateId } from "./id";
import { nowIso } from "./dates";

/**
 * localStorage への読み書きはこのファイルに集約する。
 * 他のファイルから localStorage.getItem / setItem を直接呼び出すことを禁止する
 * （設計書 4.1節）。呼び出し側は必ず src/hooks/useTasks.ts を経由する。
 */

export class StorageParseError extends Error {}
export class StorageVersionError extends Error {}
export class StorageQuotaError extends Error {}

/** unknown を Task[] として最低限の形だけ検証する。壊れた要素は除外する。 */
function coerceTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Task => {
    return (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "title" in item &&
      "status" in item
    );
  });
}

/** schemaVersion が古い場合、不足フィールドを補って現在のバージョンに合わせる（F-14）。 */
function migrate(data: TaskAppData): TaskAppData {
  if (data.schemaVersion === CURRENT_SCHEMA_VERSION) return data;

  // バージョン1のみ存在する現時点では、欠けているフィールドを既定値で補うのみ。
  const migratedTasks = data.tasks.map((task) => ({
    ...task,
    archivedAt: task.archivedAt ?? null,
    trashedAt: task.trashedAt ?? null,
    endTime: task.endTime ?? null,
  }));

  return { schemaVersion: CURRENT_SCHEMA_VERSION, tasks: migratedTasks };
}

/**
 * 全タスクを読み込む。
 * データが存在しない場合は空配列を返す（F-13）。
 * JSON の解析に失敗した場合は StorageParseError を投げる（F-13）。
 * schemaVersion が現在値より古い場合はマイグレーションしてから返す（F-14）。
 * schemaVersion が現在値より新しい場合は StorageVersionError を投げる（F-14）。
 */
export function loadTasks(): Task[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new StorageParseError("保存データの JSON 解析に失敗しました");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("schemaVersion" in parsed) ||
    typeof (parsed as { schemaVersion: unknown }).schemaVersion !== "number"
  ) {
    throw new StorageParseError("保存データの構造が不正です");
  }

  const data = parsed as TaskAppData;

  if (data.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new StorageVersionError(
      `保存データの schemaVersion (${data.schemaVersion}) がアプリの対応バージョン (${CURRENT_SCHEMA_VERSION}) より新しいです`,
    );
  }

  const withValidTasks: TaskAppData = { ...data, tasks: coerceTasks(data.tasks) };
  const migrated = migrate(withValidTasks);

  if (migrated.schemaVersion !== data.schemaVersion) {
    // マイグレーションが発生した場合は書き戻す。ここは経路上唯一の直接書き込みで、
    // saveTasks を再利用するとデバウンスの都合で即時反映されないため直接行う。
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
  }

  return migrated.tasks;
}

/**
 * 全タスクを保存する。
 *
 * 設計時点（design.md v0.1〜0.2）では 500ミリ秒のデバウンスを想定していたが、
 * 4.4節で導入した「各操作が boolean で成否を返し、失敗時は React の状態を
 * 元に戻す」という設計（lastActionError）と、遅延書き込みは相性が悪い。
 * デバウンスすると setTasks 直後の呼び出し元は「まだ書き込まれていない」
 * 状態で成否を判定することになり、実際の書き込み失敗を取りこぼす。
 * そのため実装では同期的に window.localStorage.setItem を呼び、
 * 呼び出しごとに成否を確定させる方針に変更した。連続呼び出しの頻度が
 * 要件 6.5 の性能基準（タップから200ミリ秒以内）を圧迫する規模になった
 * 場合は、書き込み対象を分割する O-12 の対応と合わせて再検討する。
 *
 * 保存に失敗した場合（容量超過など）は StorageQuotaError を投げる（F-13）。
 */
export function saveTasks(tasks: Task[]): void {
  const data: TaskAppData = { schemaVersion: CURRENT_SCHEMA_VERSION, tasks };
  const serialized = JSON.stringify(data);

  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    throw new StorageQuotaError(
      e instanceof Error ? e.message : "保存に失敗しました",
    );
  }
}

/**
 * 保存されているデータを完全に削除する（F-13 の初期化ボタン用）。
 */
export function clearTasks(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * 開発専用のデバッグ用シード関数（設計書 7章）。
 * F-04（自動アーカイブ）のような、システム時刻を進められない条件の動作確認のために、
 * 任意のフィールドを上書きしたタスクを1件注入する。
 * 本番のユーザー操作からは呼ばれない。
 */
export function __devSeedTask(overrides: Partial<Task>): void {
  const tasks = loadTasks();
  const now = nowIso();
  tasks.push({
    id: generateId(),
    title: "デバッグ用タスク",
    ...DEFAULT_TASK_VALUES,
    status: "active",
    completedAt: null,
    archivedAt: null,
    trashedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
  saveTasks(tasks);
}

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __devSeedTask: typeof __devSeedTask }).__devSeedTask = __devSeedTask;
}
