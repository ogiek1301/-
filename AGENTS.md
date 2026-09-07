<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## プロジェクト概要

スマートフォンで使う、1人用のタスク管理アプリケーション。優先度・期日付きのタスクと、時刻を持つ予定（人との約束）を同じ一覧で管理し、月表示カレンダーで俯瞰できる。外部カレンダーへの登録は、Gemini に貼り付けるためのプロンプト文を生成することで補助する。詳細は `docs/requirements.md`、`docs/data-model.md`、`docs/design.md` を参照。

## 技術スタック

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- データ保存は localStorage のみ。DB、外部 API、認証、状態管理ライブラリは使用しない

## ディレクトリ構成のルール

```
src/app/          # ルーティング。1ルート = 1ページ。ロジックを直接書いてよいが、
                   # 複数画面で共有する処理は src/lib か src/components に出す
src/components/   # 機能単位（F-01〜F-14 に対応）でサブディレクトリを切る
                   # 例: task/, calendar/, voice/, gemini/, feedback/, ui/, layout/
src/lib/          # ロジックの純粋関数。React に依存しないコードはここに置く
                   # storage.ts, dates.ts, sort.ts, validation.ts, dateKeywords.ts,
                   # id.ts, prompt.ts, clipboard.ts
src/types/        # 型定義と、その型に強く結びついた定数
                   # task.ts に Task, TaskStatus, Priority, TaskAppData,
                   # CURRENT_SCHEMA_VERSION, STORAGE_KEY, MAX_LENGTH, DEFAULT_TASK_VALUES
```

新しいトップレベルディレクトリを `src/` 直下に追加しない。上記4つのいずれかに置き場所がないと判断した場合は、追加する前に `docs/design.md` を更新する。

詳細な分割方針とファイル一覧は `docs/design.md` の3章を参照。

## コーディング規約

- **命名**: コンポーネントは `PascalCase`（例: `TaskListItem.tsx`）。関数・変数・カスタムフックは `camelCase`（例: `useTasks`、`loadTasks`）。型・interface は `PascalCase`（例: `Task`、`TaskStatus`）。定数は `UPPER_SNAKE_CASE`（例: `CURRENT_SCHEMA_VERSION`、`MAX_LENGTH`）
- **export の書き方**: 各ファイルの主たる公開物は named export にする。default export は `src/app/**/page.tsx`、`src/app/layout.tsx`、`src/app/error.tsx` のような Next.js の規約上 default export が必須なファイルに限る。コンポーネント1ファイルにつき1コンポーネントを原則とする
- **`any` を使わない**: `any` 型の使用を禁止する。型が不明な外部入力（`JSON.parse` の戻り値など）は `unknown` として受け取り、`src/lib/storage.ts` 内でスキーマに沿っているかを検証してから `Task` 型として扱う。型アサーション（`as Task` など）は検証を経ていない箇所では使わない
- 日付・時刻の扱いは `docs/data-model.md` の1章に従う。`new Date("YYYY-MM-DD")` のように日付のみの文字列を `Date` に渡すことを禁止する。日本時間への変換は `src/lib/dates.ts` の `toJstDate` / `todayJst` のみを経由する

## よく使うコマンド

```bash
npm run dev      # 開発サーバーの起動
npm run build    # 型チェックとビルド
npm run lint     # ESLint によるコード規約チェック
```

## Server Component と Client Component の使い分け

localStorage を読み書きするコンポーネントは必ず Client Component（ファイル先頭に `"use client"`）にする。本アプリではこれが唯一の判断基準であり、これ以外の基準で悩む必要はない。

- 実質的にほぼすべてのコンポーネントが Client Component になる。各 `page.tsx`、`src/components/` 配下のコンポーネントはすべて `"use client"` を付ける
- **`src/app/layout.tsx` は例外で、Server Component のままにする（`"use client"` を付けない）。** 中で呼び出す `BottomNav` だけを Client Component にし、`layout.tsx` はその親として `<html>` / `<body>` を返すだけにする
- **`"use client"` は「サーバーで一切実行されない」ことを意味しない。** Client Component もサーバー側で一度プリレンダリングされるため、`localStorage` へのアクセスはレンダリング本体や `useState` の初期化関数の中で行ってはならず、必ず `useEffect` の中でのみ行う。違反するとハイドレーションエラーになる

詳細な実装パターンは `docs/design.md` の2章・4.4章を参照。

## やってはいけないこと

- **データベース・外部 API・認証を導入しない。** データはブラウザの localStorage にのみ保存する。音声入力（Web Speech API）に限りブラウザの実装により外部通信が発生するが、これはブラウザ内蔵の仕組みであり、アプリケーションが独自に外部 API を呼び出すことではない。それ以外の機能で fetch や外部 SDK を追加しない
- **新しいライブラリを勝手に追加しない。** `package.json` の依存関係を変更する前に、なぜ Next.js / TypeScript / Tailwind CSS の標準機能だけでは実現できないかを説明し、確認を取ってから追加する
- **localStorage に `src/lib/storage.ts` の外から直接アクセスしない。** `localStorage.getItem` / `localStorage.setItem` を呼び出すコードは `src/lib/storage.ts` にのみ存在してよい。他のファイルは `src/hooks/useTasks.ts` が提供する関数を経由する
- **ブラウザで動作確認せずに「完了」と報告しない。** `npm run build` が通ることと、ブラウザで意図どおり動くことは別である。コードを変更したら、`docs/design.md` の7章の手順に従い、少なくとも1つの対応ブラウザで実際に操作してから完了を報告する
