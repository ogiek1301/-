"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { NewTaskInput } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";
import { TaskForm } from "@/components/task/TaskForm";
import { getCategorySuggestions } from "@/lib/categories";

/** S-03（編集）。既存タスクの編集（F-02）。 */
export default function EditTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { tasks, isLoading, updateTask } = useTasks();

  const task = tasks.find((t) => t.id === params.id);

  const handleSubmit = (values: NewTaskInput) => {
    if (updateTask(params.id, values)) {
      router.push("/");
    }
  };

  if (isLoading) {
    return <div className="flex-1 px-4 py-6" />;
  }

  if (!task) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center">
        <p className="text-gray-700">タスクが見つかりません</p>
        <Link href="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          タスク一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">タスクを編集</h1>
      <TaskForm
        initialValues={{
          title: task.title,
          memo: task.memo,
          dueDate: task.dueDate,
          startTime: task.startTime,
          endTime: task.endTime,
          priority: task.priority,
          category: task.category,
        }}
        categorySuggestions={getCategorySuggestions(tasks)}
        onSubmit={handleSubmit}
        submitLabel="保存"
      />
    </div>
  );
}
