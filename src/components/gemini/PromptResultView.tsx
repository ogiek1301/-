"use client";

import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { Button } from "@/components/ui/Button";

interface PromptResultViewProps {
  text: string;
}

/**
 * 生成されたプロンプト文の表示とコピー操作（F-11, F-12 共通）。
 * navigator.clipboard が使えない環境（セキュアコンテキスト外）では、
 * 全選択状態のテキストエリアに切り替えて長押しコピーを促す（要件 6.8）。
 */
export function PromptResultView({ text }: PromptResultViewProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "unsupported">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "unsupported" && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [status]);

  const handleCopy = async () => {
    const result = await copyText(text);
    setStatus(result);
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
      {status === "unsupported" ? (
        <textarea
          ref={textareaRef}
          readOnly
          value={text}
          rows={8}
          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
      ) : (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-sm text-gray-800">{text}</pre>
      )}
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={handleCopy}>
          コピー
        </Button>
        {status === "copied" && <span className="text-sm text-green-700">コピーしました</span>}
        {status === "unsupported" && (
          <span className="text-sm text-amber-700">長押しでコピーしてください</span>
        )}
      </div>
    </div>
  );
}
