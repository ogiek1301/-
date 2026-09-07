"use client";

import { useState, type FormEvent } from "react";
import type { NewTaskInput, Priority } from "@/types/task";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { CategoryInput } from "@/components/task/CategoryInput";
import { VoiceInputButton } from "@/components/voice/VoiceInputButton";
import { validateTaskForm } from "@/lib/validation";
import { inferDueDateFromTitle } from "@/lib/dateKeywords";

interface TaskFormProps {
  initialValues?: NewTaskInput;
  categorySuggestions: string[];
  onSubmit: (values: NewTaskInput) => void;
  submitLabel: string;
}

const PRIORITY_ITEMS: { value: Priority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

const EMPTY_VALUES: NewTaskInput = {
  title: "",
  memo: "",
  dueDate: null,
  startTime: null,
  endTime: null,
  priority: "medium",
  category: null,
};

/**
 * タスクの追加・編集で共有するフォーム本体（F-01, F-02）。
 * バリデーションは src/lib/validation.ts に切り出し、ここではエラー表示のみ行う
 * （design.md 3.3節）。優先度の初期値は「中」（要件 O-05）。
 */
export function TaskForm({ initialValues, categorySuggestions, onSubmit, submitLabel }: TaskFormProps) {
  const base = initialValues ?? EMPTY_VALUES;
  const [title, setTitle] = useState(base.title);
  const [memo, setMemo] = useState(base.memo);
  const [dueDate, setDueDate] = useState(base.dueDate ?? "");
  const [startTime, setStartTime] = useState(base.startTime ?? "");
  const [endTime, setEndTime] = useState(base.endTime ?? "");
  const [priority, setPriority] = useState<Priority>(base.priority);
  const [category, setCategory] = useState(base.category ?? "");
  const [errors, setErrors] = useState<ReturnType<typeof validateTaskForm>["errors"]>({});

  /**
   * F-10 ルールベースの日付推測。期日欄に手動入力済みの値がある場合は上書きしない。
   * 音声認識の結果もキーボード入力も、この関数を通すことで挙動を統一する（design.md 3.3節）。
   */
  const applyDateInference = (nextTitle: string) => {
    if (dueDate) return;
    const inferred = inferDueDateFromTitle(nextTitle);
    if (inferred) setDueDate(inferred);
  };

  const handleTitleBlur = () => {
    applyDateInference(title);
  };

  const handleVoiceResult = (transcript: string) => {
    const nextTitle = title.trim() ? `${title}${transcript}` : transcript;
    setTitle(nextTitle);
    applyDateInference(nextTitle);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const values: NewTaskInput = {
      title,
      memo,
      dueDate: dueDate || null,
      startTime: startTime || null,
      endTime: endTime || null,
      priority,
      category: category.trim() || null,
    };

    const result = validateTaskForm(values);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    onSubmit({ ...values, title: title.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="タイトル"
            value={title}
            onChange={setTitle}
            onBlur={handleTitleBlur}
            error={errors.title}
          />
        </div>
        <VoiceInputButton onResult={handleVoiceResult} />
      </div>
      <TextField label="メモ" value={memo} onChange={setMemo} multiline error={errors.memo} />
      <TextField label="期日" type="date" value={dueDate} onChange={setDueDate} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="開始時刻" type="time" value={startTime} onChange={setStartTime} />
        <TextField label="終了時刻" type="time" value={endTime} onChange={setEndTime} />
      </div>
      {errors.time && <p className="text-sm text-red-600">{errors.time}</p>}

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">優先度</span>
        <div className="flex gap-2">
          {PRIORITY_ITEMS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPriority(item.value)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                priority === item.value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <CategoryInput value={category} onChange={setCategory} suggestions={categorySuggestions} error={errors.category} />

      <Button type="submit" className="mt-2 w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
