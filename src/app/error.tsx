"use client";

/**
 * ルートレベルのエラー境界（F-13、design.md 1章）。
 * 予期しない例外が発生した場合に、Next.js の開発者用オーバーレイの代わりに
 * この画面を表示する。
 */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-gray-700">エラーが発生しました</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        リロード
      </button>
    </div>
  );
}
