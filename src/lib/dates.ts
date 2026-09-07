/**
 * 日付・時刻の変換をここに集約する。
 *
 * 要件 5.1.4:
 * - `new Date("2026-09-07")` のように日付のみの文字列を Date に渡すことは
 *   禁止する（UTC として解釈され、日本時間では1日ずれるため）。
 * - タイムゾーン指定を含む ISO 8601 日時文字列（末尾が "Z"）のパースは
 *   禁止の対象外であり、この2関数に処理を集約する。
 * - 日付の前後比較は、常に YYYY-MM-DD 形式の文字列比較で行う。
 */

/**
 * UTC の ISO 8601 日時文字列を、日本時間の YYYY-MM-DD に変換する。
 * ロケール "sv-SE" は YYYY-MM-DD 形式を返すため、文字列の組み立てが不要になる。
 */
export function toJstDate(isoDateTime: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date(isoDateTime));
}

/**
 * 現在時刻の日本時間の日付を YYYY-MM-DD で返す。
 */
export function todayJst(): string {
  return toJstDate(new Date().toISOString());
}

/**
 * 現在時刻の ISO 8601 UTC 日時文字列を返す。
 * createdAt / updatedAt / completedAt / archivedAt / trashedAt はすべて
 * この形式で保存する（データモデル定義書 1.2）。
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * a が b より前（文字列として小さい）かどうかを YYYY-MM-DD 比較で判定する。
 * 期日の前後比較はすべてこの関数を経由する。
 */
export function isDateBefore(a: string, b: string): boolean {
  return a < b;
}
