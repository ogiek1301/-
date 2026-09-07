"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { DayTaskList } from "@/components/calendar/DayTaskList";
import { todayJst } from "@/lib/dates";

/** S-02 カレンダー画面。 */
export default function CalendarPage() {
  const { tasks, isLoading } = useTasks();
  const today = todayJst();
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)));
  const [selectedDate, setSelectedDate] = useState<string | null>(today);

  const activeTasks = tasks.filter((t) => t.status === "active");

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">カレンダー</h1>
      {!isLoading && (
        <>
          <MonthCalendar
            year={year}
            month={month}
            tasks={activeTasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          {selectedDate && (
            <div className="mt-4">
              <DayTaskList date={selectedDate} tasks={activeTasks} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
