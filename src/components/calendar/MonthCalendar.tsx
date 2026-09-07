"use client";

import type { Task } from "@/types/task";

interface MonthCalendarProps {
  year: number;
  month: number;
  tasks: Task[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function firstWeekday(year: number, month: number): number {
  return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

/**
 * 当月の月表示グリッド（F-08）。各マスに、その日を dueDate とする
 * status="active" のタスク件数を表示する。アーカイブ・ごみ箱は集計から除外する
 * （要件 F-08 の受け入れ条件、tasks.md 4-4）。
 */
export function MonthCalendar({
  year,
  month,
  tasks,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: MonthCalendarProps) {
  const countByDate = new Map<string, number>();
  for (const task of tasks) {
    if (task.status === "active" && task.dueDate) {
      countByDate.set(task.dueDate, (countByDate.get(task.dueDate) ?? 0) + 1);
    }
  }

  const total = daysInMonth(year, month);
  const leading = firstWeekday(year, month);
  const cells: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: total }, (_, i) => toDateStr(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          前の月
        </button>
        <span className="text-sm font-medium text-gray-900">
          {year}年{month}月
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          次の月
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 text-center text-xs text-gray-500">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (date === null) return <div key={i} />;
          const count = countByDate.get(date) ?? 0;
          const day = Number(date.slice(-2));
          const isSelected = date === selectedDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`flex flex-col items-center rounded-lg py-1.5 text-sm ${
                isSelected ? "bg-blue-600 text-white" : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span>{day}</span>
              {count > 0 && (
                <span
                  className={`mt-0.5 rounded-full px-1.5 text-[10px] ${
                    isSelected ? "bg-white/30" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
