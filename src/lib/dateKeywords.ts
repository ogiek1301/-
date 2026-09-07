import { todayJst } from "./dates";

/**
 * F-10 ルールベースの日付推測。対象は次の8語に限定する（要件 5.11）。
 * 週の起点は月曜日とする。
 *
 * 音声認識の結果もキーボード入力も、この関数を通すことで挙動を統一する
 * （設計書 3.4節）。
 */
const KEYWORD_ORDER = [
  "今日",
  "明日",
  "明後日",
  "今週",
  "来週",
  "今月",
  "来月",
  "週末",
] as const;

type Keyword = (typeof KEYWORD_ORDER)[number];

/** YYYY-MM-DD 文字列に日数を加算し、YYYY-MM-DD で返す（JST のカレンダー日での加算）。 */
function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  // UTC のフィールドとして組み立てることで、ローカルタイムゾーンの影響を避ける。
  // 対象はあくまで日付のみの加算であり、時刻情報は持たない。
  const utcMs = Date.UTC(y, m - 1, d) + days * 86400000;
  const result = new Date(utcMs);
  const yyyy = result.getUTCFullYear();
  const mm = String(result.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(result.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getWeekday(dateStr: string): number {
  // 0 = 日曜, 1 = 月曜, ..., 6 = 土曜
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function lastDayOfMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  // 翌月の0日目 = 当月の末日
  const result = new Date(Date.UTC(y, m, 0));
  const yyyy = result.getUTCFullYear();
  const mm = String(result.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(result.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function firstDayOfNextMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  const result = new Date(Date.UTC(y, m, 1));
  const yyyy = result.getUTCFullYear();
  const mm = String(result.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

function resolveKeyword(keyword: Keyword, today: string): string {
  switch (keyword) {
    case "今日":
      return today;
    case "明日":
      return addDays(today, 1);
    case "明後日":
      return addDays(today, 2);
    case "今週": {
      // 週の起点は月曜日。今週の日曜日（週の終わり）を返す。
      const weekday = getWeekday(today); // 0=日,1=月,...,6=土
      const daysUntilSunday = weekday === 0 ? 0 : 7 - weekday;
      return addDays(today, daysUntilSunday);
    }
    case "来週": {
      const weekday = getWeekday(today);
      const daysUntilNextMonday = weekday === 0 ? 1 : 8 - weekday;
      return addDays(today, daysUntilNextMonday);
    }
    case "今月":
      return lastDayOfMonth(today);
    case "来月":
      return firstDayOfNextMonth(today);
    case "週末": {
      const weekday = getWeekday(today);
      const daysUntilSaturday = weekday === 6 ? 0 : (6 - weekday + 7) % 7;
      return addDays(today, daysUntilSaturday);
    }
  }
}

/**
 * タイトル文字列の中から、対象キーワードのうち最初に出現するものを探し、
 * 対応する日付（YYYY-MM-DD）を返す。見つからなければ null。
 * 複数のキーワードを含む場合は、文字列中で最初に出現したものだけを採用する。
 */
export function inferDueDateFromTitle(title: string, today: string = todayJst()): string | null {
  let firstIndex = -1;
  let firstKeyword: Keyword | null = null;

  for (const keyword of KEYWORD_ORDER) {
    const index = title.indexOf(keyword);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
      firstKeyword = keyword;
    }
  }

  if (firstKeyword === null) {
    return null;
  }

  return resolveKeyword(firstKeyword, today);
}
