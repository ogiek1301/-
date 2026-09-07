import type { Task } from "@/types/task";

/**
 * 保存済みタスクの category から重複を除いて候補一覧を算出する（要件 F-07, O-06）。
 * カテゴリ専用の保存領域は持たない。
 * ごみ箱・アーカイブのタスクも含める（「削除されたタスクだけが持っていたカテゴリ」も
 * 過去に使われた語として候補に残す方が実用上自然なため。ただし要件 F-07 の受け入れ
 * 条件は「削除されて絞り込みの選択肢から消える」ことのみを定めており、これは
 * getAvailableCategoryFilters（絞り込み用、active のタスクのみを対象とする）で扱う）。
 */
export function getCategorySuggestions(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const task of tasks) {
    if (task.category) set.add(task.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
}

/**
 * カテゴリ絞り込み（F-07）の選択肢一覧。
 * status="active" のタスクの category のみを対象とする。あるカテゴリを持つ
 * タスクがすべてごみ箱に移動すると、その語は選択肢から消える。
 */
export function getAvailableCategoryFilters(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const task of tasks) {
    if (task.status === "active" && task.category) set.add(task.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"));
}
