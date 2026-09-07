"use client";

interface ErrorStateProps {
  variant: "full" | "inline";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

/**
 * variant="full": loadError（起動時の読み込み失敗）用。画面全体を覆う。
 * variant="inline": lastActionError（操作時の書き込み失敗）用。画面を維持したまま通知のみ表示する。
 * （設計書 6.2節）
 */
export function ErrorState({ variant, message, actionLabel, onAction, onDismiss }: ErrorStateProps) {
  if (variant === "full") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-gray-700">{message}</p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="閉じる" className="shrink-0 text-red-600">
          ✕
        </button>
      )}
    </div>
  );
}
