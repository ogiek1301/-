import { MAX_LENGTH } from "@/types/task";

/**
 * 要件 6.4 のバリデーション。
 * 文字数は Array.from(str).length で Unicode のコードポイント単位で数える。
 * String.prototype.length は使わない（UTF-16 コード単位のため、絵文字や
 * 一部の漢字が2文字と数えられ、見た目と一致しない）。
 */
function codepointLength(value: string): number {
  return Array.from(value).length;
}

export interface ValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    memo?: string;
    category?: string;
    time?: string;
  };
}

export interface TaskFormValues {
  title: string;
  memo: string;
  dueDate: string | null;
  startTime: string | null;
  endTime: string | null;
  category: string | null;
}

export function validateTaskForm(values: TaskFormValues): ValidationResult {
  const errors: ValidationResult["errors"] = {};

  const trimmedTitle = values.title.trim();
  if (trimmedTitle.length === 0) {
    errors.title = "タイトルを入力してください";
  } else if (codepointLength(trimmedTitle) > MAX_LENGTH.title) {
    errors.title = `タイトルは${MAX_LENGTH.title}文字以内で入力してください`;
  }

  if (codepointLength(values.memo) > MAX_LENGTH.memo) {
    errors.memo = `メモは${MAX_LENGTH.memo}文字以内で入力してください`;
  }

  const trimmedCategory = values.category?.trim() ?? "";
  if (trimmedCategory.length > 0 && codepointLength(trimmedCategory) > MAX_LENGTH.category) {
    errors.category = `カテゴリは${MAX_LENGTH.category}文字以内で入力してください`;
  }

  const hasTime = values.startTime !== null || values.endTime !== null;
  if (hasTime && !values.dueDate) {
    errors.time = "時刻を入力する場合は期日も入力してください";
  } else if (values.startTime && values.endTime && values.endTime <= values.startTime) {
    errors.time = "終了時刻は開始時刻より後にしてください";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
