"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { PromptResultView } from "@/components/gemini/PromptResultView";
import { buildCalendarPrompt, buildOrganizePrompt } from "@/lib/prompt";

type GeneratePromptButtonProps =
  | { kind: "calendar"; tasks: Task[] }
  | { kind: "organize"; pastedText: string };

const LABEL: Record<GeneratePromptButtonProps["kind"], string> = {
  calendar: "カレンダー登録用プロンプトを作成",
  organize: "整理用プロンプトを作成",
};

const EMPTY_MESSAGE: Record<GeneratePromptButtonProps["kind"], string> = {
  calendar: "未完了のタスクがありません",
  organize: "テキストを貼り付けてください",
};

/**
 * F-11（カレンダー登録用）と F-12（整理用）のプロンプト生成ボタン共通処理。
 * kind によって呼び出すビルド関数を切り替える（tasks.md 5-2, 5-3）。
 */
export function GeneratePromptButton(props: GeneratePromptButtonProps) {
  const [result, setResult] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const handleClick = () => {
    const text =
      props.kind === "calendar" ? buildCalendarPrompt(props.tasks) : buildOrganizePrompt(props.pastedText);

    if (text === null) {
      setIsEmpty(true);
      setResult(null);
    } else {
      setIsEmpty(false);
      setResult(text);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="secondary" onClick={handleClick} className="w-full">
        {LABEL[props.kind]}
      </Button>
      {isEmpty && <p className="text-sm text-red-600">{EMPTY_MESSAGE[props.kind]}</p>}
      {result !== null && <PromptResultView text={result} />}
    </div>
  );
}
