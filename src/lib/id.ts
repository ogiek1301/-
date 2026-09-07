/**
 * タスク ID を生成する。
 *
 * crypto.randomUUID() は使用しない。セキュアコンテキスト（HTTPS または
 * localhost）でのみ動作するため、開発中にスマートフォン実機を
 * http://192.168.x.x:3000 のようなアドレスで開いた場合に例外になる
 * （要件 6.8、データモデル定義書 5章）。
 */
export function generateId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}
