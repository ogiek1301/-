/**
 * navigator.clipboard は HTTPS または localhost（セキュアコンテキスト）でのみ
 * 利用できる（要件 6.8）。開発中にスマートフォン実機を http://192.168.x.x:3000
 * のようなアドレスで開いた場合は利用できないため、フォールバックが必須。
 */
export type CopyResult = "copied" | "unsupported";

export async function copyText(text: string): Promise<CopyResult> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      // 権限拒否などで失敗した場合もフォールバック扱いにする
      return "unsupported";
    }
  }
  return "unsupported";
}
