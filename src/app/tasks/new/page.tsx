"use client";

import { useRouter } from "next/navigation";
import type { NewTaskInput } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { TaskForm } from "@/components/task/TaskForm";
import { getCategorySuggestions } from "@/lib/categories";

/** S-03（追加）。タスクの新規作成（F-01）。 */
export default function NewTaskPage() {
  const router = useRouter();
  const { tasks, addTask } = useTasks();

  const handleSubmit = (values: NewTaskInput) => {
    if (addTask(values)) {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">タスクを追加</h1>
      <TaskForm
        categorySuggestions={getCategorySuggestions(tasks)}
        onSubmit={handleSubmit}
        submitLabel="保存"
      />
    </div>
  );
}
