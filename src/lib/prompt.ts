import type { Task } from "@/types/task";
import { isActiveIncomplete, sortActiveTasks } from "./sort";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

function formatTaskLine(task: Task): string {
  const parts: string[] = [`- ${task.title}`];
  if (task.dueDate) {
    let timePart = "";
    if (task.startTime && task.endTime) {
      timePart = ` ${task.startTime}-${task.endTime}`;
    } else if (task.startTime) {
      timePart = ` ${task.startTime}`;
    }
    parts.push(`（期日: ${task.dueDate}${timePart}、優先度: ${PRIORITY_LABEL[task.priority]}）`);
  } else {
    parts.push(`（期日未定、優先度: ${PRIORITY_LABEL[task.priority]}）`);
  }
  return parts.join("");
}

/**
 * F-11 外部カレンダー登録用プロンプトの生成。
 * 対象は未完了タスクのみ（完了済み・アーカイブ・ごみ箱は含まない）。
 * 並び順は F-06 の規則（sortActiveTasks）に従う。
 * 未完了タスクが0件の場合は null を返す（受け入れ条件どおり、呼び出し側で
 * 「未完了のタスクがありません」を表示する）。
 */
export function buildCalendarPrompt(tasks: Task[]): string | null {
  const incomplete = tasks.filter(isActiveIncomplete);
  if (incomplete.length === 0) return null;

  const sorted = sortActiveTasks(incomplete); // 完了済みが混ざらないので実質未完了のみの並びになる
  const lines = sorted.map(formatTaskLine);

  return [
    "以下のタスクを Google カレンダーに登録してください。",
    "期日と時刻があるものは日時指定の予定として、期日のみのものは終日の予定として扱ってください。",
    "",
    ...lines,
  ].join("\n");
}

/**
 * F-12 貼り付けテキスト整理用プロンプトの生成。
 * 空文字（前後の空白のみを含む）の場合は null を返す。
 */
export function buildOrganizePrompt(pastedText: string): string | null {
  const trimmed = pastedText.trim();
  if (trimmed.length === 0) return null;

  return [
    "以下は会話やメールから貼り付けた、整理されていないテキストです。",
    "この中からタスクとして扱うべき項目を抽出し、タイトル・期日・優先度の形に整理してください。",
    "",
    "---",
    trimmed,
    "---",
  ].join("\n");
}
