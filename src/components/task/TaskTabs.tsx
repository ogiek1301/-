"use client";

export type PeriodTab = "today" | "all";
export type StatusTab = "active" | "archived" | "trashed";

interface TaskTabsProps {
  period: PeriodTab;
  onPeriodChange: (period: PeriodTab) => void;
  status: StatusTab;
  onStatusChange: (status: StatusTab) => void;
}

const PERIOD_ITEMS: { value: PeriodTab; label: string }[] = [
  { value: "today", label: "今日" },
  { value: "all", label: "全体" },
];

const STATUS_ITEMS: { value: StatusTab; label: string }[] = [
  { value: "active", label: "未完了" },
  { value: "archived", label: "アーカイブ" },
  { value: "trashed", label: "ごみ箱" },
];

/**
 * 「今日 / 全体」と「未完了 / アーカイブ / ごみ箱」の2軸切り替え（O-01）。
 * 選択状態は保存しない（要件 6.10）。
 */
export function TaskTabs({ period, onPeriodChange, status, onStatusChange }: TaskTabsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {PERIOD_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onPeriodChange(item.value)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
              period === item.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3 overflow-x-auto text-sm">
        {STATUS_ITEMS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onStatusChange(item.value)}
            className={`shrink-0 border-b-2 pb-1 font-medium ${
              status === item.value ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
