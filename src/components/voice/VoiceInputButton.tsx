"use client";

import { useEffect, useState } from "react";

/**
 * F-09 音声入力。Web Speech API（`webkitSpeechRecognition`）を使用する。
 * この API は端末内で認識を完結させず、ブラウザの実装により音声データが外部サーバーへ
 * 送信される（要件 6.7）。この外部通信は O-13 で許容することが決定済み。
 * 対応ブラウザは Android Chrome とデスクトップ Chrome/Edge のみで、iOS 上のブラウザは
 * すべて WebKit のため非対応（要件 6.1）。
 */

interface SpeechRecognitionResultLike {
  transcript: string;
}

interface SpeechRecognitionEventLike extends Event {
  results: { [index: number]: { [index: number]: SpeechRecognitionResultLike } };
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

type Status = "idle" | "listening" | "denied" | "offline";

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
}

export function VoiceInputButton({ onResult }: VoiceInputButtonProps) {
  // サーバーとクライアントの初回レンダリングを一致させるため、対応判定は
  // useEffect の中で行い、判定が終わるまでは何も描画しない（ハイドレーション不一致の防止）。
  const [supported, setSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    // ブラウザ API の対応判定はサーバーでは行えないため、マウント後にここで判定する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof (window as WindowWithSpeechRecognition).webkitSpeechRecognition === "function");
  }, []);

  if (supported === null) return null;

  if (!supported) {
    return <p className="text-sm text-gray-500">このブラウザは音声入力に対応していません</p>;
  }

  const handleClick = () => {
    if (status === "listening") return;

    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }

    const SpeechRecognitionCtor = (window as WindowWithSpeechRecognition).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "ja-JP";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
      setStatus("idle");
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        setStatus("denied");
      } else if (event.error === "network") {
        setStatus("offline");
      } else {
        setStatus("idle");
      }
    };

    recognition.onend = () => {
      setStatus((current) => (current === "listening" ? "idle" : current));
    };

    setStatus("listening");
    recognition.start();
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-label={status === "listening" ? "音声入力中" : "音声入力"}
        onClick={handleClick}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg ${
          status === "listening" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        🎤
      </button>
      {status === "denied" && <p className="text-sm text-red-600">マイクの使用が許可されていません</p>}
      {status === "offline" && <p className="text-sm text-red-600">音声入力にはインターネット接続が必要です</p>}
    </div>
  );
}
