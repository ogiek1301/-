# 技術設計書

作成日: 2026-09-07
バージョン: 0.2
対応する要件定義書: `docs/requirements.md` バージョン 0.3
対応するデータモデル定義書: `docs/data-model.md` バージョン 0.2

## 更新履歴

| バージョン | 日付 | 内容 |
| --- | --- | --- |
| 0.1 | 2026-09-07 | 初版 |
| 0.2 | 2026-09-07 | レビュー指摘を反映。ハイドレーション不一致を防ぐ実装パターンを2章・4章に明記、`layout.tsx` の Server/Client 境界を2章に明記、`TaskListItem` の状態別操作ボタンを `variant` props として3.3節に追加、個別操作の失敗を `lastActionError` として型に反映、空状態に「今日タブが0件」のケースを追加、`gemini/` の過剰な分割を統合、動作確認手順が `storage.ts` 集約方針を自ら破っていた点を修正、8章の O-01 に関する誤った記述を訂正 |

技術スタックは次のとおり固定する。代替案の検討は行わない。

- Next.js（App Router）/ TypeScript / Tailwind CSS
- データ保存は localStorage のみ。DB、外部 API、認証、状態管理ライブラリは使用しない

---

## 1. 画面とルーティング

要件 4.2 の3画面、4ルートをそのまま `src/app` 配下のディレクトリに対応させる。

| 画面ID | URL | ディレクトリ | ファイル |
| --- | --- | --- | --- |
| S-01 | `/` | `src/app/` | `page.tsx` |
| S-02 | `/calendar` | `src/app/calendar/` | `page.tsx` |
| S-03（追加） | `/tasks/new` | `src/app/tasks/new/` | `page.tsx` |
| S-03（編集） | `/tasks/[id]` | `src/app/tasks/[id]/` | `page.tsx` |

```
src/app/
├── layout.tsx              # 全画面共通のルートレイアウト。下部ナビゲーションを含む
├── page.tsx                 # S-01 タスク一覧
├── calendar/
│   └── page.tsx              # S-02 カレンダー
├── tasks/
│   ├── new/
│   │   └── page.tsx           # S-03 タスク追加
│   └── [id]/
│       └── page.tsx           # S-03 タスク編集
├── error.tsx                 # ルートレベルのエラー境界（F-13）
└── globals.css
```

`layout.tsx` に下部固定ナビゲーション（`BottomNav`）を配置し、3画面すべてから参照できるようにする。要件 4.2 の「S-01 を起動時の初期表示とする」は `/` をタスク一覧に割り当てることで満たす。

`/tasks/[id]` は要件 F-02 の「存在しない id」のケースをページ内で判定し、404 ページへの遷移ではなく「タスクが見つかりません」という文言をページ内に表示する（localStorage の中身はサーバーからは分からず、Next.js の `notFound()` はサーバー側の判定を前提とするため、クライアント側での判定に統一する）。

---

## 2. Server Component と Client Component の切り分け方針

### 2.1 原則

localStorage はブラウザにしか存在しない。**localStorage を読み書きするコンポーネントは必ず Client Component（ファイル先頭に `"use client"`）にする。** これが本アプリの Server/Client 切り分けの唯一の判断基準であり、他の基準（データ取得の有無、インタラクティブ性の有無）は本アプリでは実質的に意味を持たない。

理由は次のとおりである。

- 本アプリはサーバーを持たず、Server Component が担う「サーバー側でのデータ取得」が発生しない
- 表示するデータはすべて localStorage 由来であり、必ずクライアント側で読み込む
- 結果として、実際にデータを扱うほぼすべてのコンポーネントが Client Component になる

**この原則には見落としやすい罠がある。** `"use client"` は「ブラウザで実行される」ことを保証するが、「サーバーでプリレンダリングされない」ことは保証しない。Next.js は Client Component もサーバー側で一度レンダリングして HTML を送り、ブラウザ側でハイドレーションする。そのサーバー側レンダリングの時点では `window` も `localStorage` も存在しない。レンダリング関数の本体（コンポーネントの return より前）や `useState` の初期化関数の中で直接 `localStorage.getItem` を呼ぶと、サーバー側で例外になるか、サーバーとクライアントで異なる内容を描画してハイドレーションエラーになる。**localStorage への読み書きは、必ず `useEffect` の中でのみ行う。** 詳細な実装パターンは4.4節に記載する。

### 2.2 実際の分類

| 種別 | 該当するもの | 理由 |
| --- | --- | --- |
| Server Component（既定のまま） | `layout.tsx`（`<html>`、`<body>`、メタデータ、`BottomNav` の呼び出し） | 静的な骨格のみで、localStorage にもインタラクションにも直接は触れない。`BottomNav` 自体は Client Component だが、それを呼び出す `layout.tsx` まで Client Component にする必要はない |
| Client Component | 各 `page.tsx`、`src/components/` 配下の全コンポーネント（`layout.tsx` を除く） | localStorage の読み書き、フォーム状態、タブ切り替え、音声入力などのブラウザ API を扱うため |

**`layout.tsx` は Server Component のままとし、`"use client"` を付けない。** その中で `BottomNav`（現在のパスをハイライトする必要があり `usePathname` を使うため Client Component）を子コンポーネントとして呼び出す。Server Component が Client Component を子として持つことは Next.js App Router の通常の構成であり、`layout.tsx` 自体を Client Component にする必要はない。

```tsx
// src/app/layout.tsx（Server Component のまま。"use client" を付けない）
import { BottomNav } from "@/components/layout/BottomNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
```

各 `page.tsx` ファイルの先頭に `"use client"` を付ける。App Router の規約上、ページ自体を Server Component の薄いラッパーにしてその中で Client Component を呼ぶ構成も可能だが、本アプリではその分離に意味がないため行わない。ページファイル自体を Client Component とし、直接ロジックとマークアップを書く。

### 2.3 例外

`layout.tsx` はすでに2.2節で述べたとおり Server Component のままでよい。それ以外に、状態を持たず localStorage にもブラウザ API にも触れない純粋な表示コンポーネント（アイコン、装飾用のラッパーなど）があれば Server Component のままでよいが、本アプリの `src/components/` 配下は 3.2節のとおりすべて何らかの形でデータやインタラクションを扱うため、実質的に該当するものはない。

---

## 3. コンポーネント分割方針

### 3.1 分割の単位

要件の機能要件（F-01 から F-14）を単位として分割する。1つの機能要件が1つ以上のコンポーネントに対応する。複数の画面で共有される表示要素（タスク1件の行など）は `src/components/task/` に集約し、S-01 と S-02 の両方から呼び出す。

### 3.2 ディレクトリ構成

```
src/components/
├── layout/
│   └── BottomNav.tsx              # 下部固定ナビゲーション（3画面共通）
├── task/
│   ├── TaskListItem.tsx            # タスク1件の行。チェックボックス・タイトル・期日・優先度を表示
│   ├── TaskList.tsx                 # TaskListItem を並び替えて並べる。空状態の分岐もここで持つ
│   ├── TaskForm.tsx                  # タスクの追加・編集で共有するフォーム本体（F-01, F-02）
│   ├── CategoryInput.tsx              # カテゴリ入力欄と入力候補（F-07）
│   ├── TaskTabs.tsx                   # 「今日 / 全体」「未完了 / アーカイブ / ごみ箱」の切り替え（O-01, F-06）
│   └── CategoryFilter.tsx              # カテゴリ絞り込みの選択UI（F-07）
├── calendar/
│   ├── MonthCalendar.tsx            # 月表示のグリッド本体（F-08）
│   └── DayTaskList.tsx               # 選択した日のタスク一覧（F-08）
├── voice/
│   └── VoiceInputButton.tsx         # マイクボタンと音声認識の状態管理（F-09）
├── gemini/
│   ├── GeneratePromptButton.tsx      # プロンプト生成ボタン。kind props で F-11/F-12 を切り替える
│   └── PromptResultView.tsx           # 生成結果の表示とコピー操作（F-11, F-12 共通、6.8 のフォールバック含む）
├── feedback/
│   ├── EmptyState.tsx                # 空状態の表示（6章参照）
│   ├── ErrorState.tsx                 # エラーの表示。variant="full" と variant="inline" を持つ（6章参照）
│   └── ConfirmDialog.tsx              # 完全削除・データ初期化の確認ダイアログ（6.6, F-13）
└── ui/
    ├── Button.tsx
    ├── Checkbox.tsx
    └── TextField.tsx
```

`src/components/ui/` は Tailwind の組み合わせを1箇所にまとめるための薄いラッパーであり、外部 UI ライブラリではない。要件の「外部 API・状態管理ライブラリは使わない」という制約に、UI コンポーネントライブラリの追加は含まれないが、依存を増やさない方針に合わせてここは自作する。

`gemini/` は当初 F-11 用・F-12 用にボタンを2ファイルへ分けていたが、両者の違いは対象データとラベルのみで、生成後の「表示してコピー」という挙動（`PromptResultView`）は完全に共通のため統合した。プロンプト文の組み立てそのものは `src/lib/prompt.ts` に `buildCalendarPrompt()` と `buildOrganizePrompt()` の2関数として持たせ、`GeneratePromptButton` は `kind="calendar" | "organize"` の props でどちらを呼ぶか切り替える。

### 3.3 TaskListItem の状態別の表示

`TaskListItem` は S-01 の4状態（未完了・完了済み・アーカイブ・ごみ箱）と S-02（カレンダーの日別一覧）から呼ばれる。呼び出し元によって出すべき操作ボタンが異なるため、`variant` props で分岐する。

```typescript
// src/components/task/TaskListItem.tsx

type TaskListItemVariant = "active" | "archived" | "trashed" | "readonly";

interface TaskListItemProps {
  task: Task;
  variant: TaskListItemVariant;
  onToggleComplete?: (id: string) => void;  // variant="active" のみ使用
  onDelete?: (id: string) => void;           // variant="active" のみ使用
  onRestore?: (id: string) => void;           // variant="archived" | "trashed" のみ使用
  onPurge?: (id: string) => void;              // variant="trashed" のみ使用
}
```

| `variant` | 呼び出し元 | 表示する操作 |
| --- | --- | --- |
| `"active"` | S-01「未完了」タブ | チェックボックス、削除ボタン |
| `"archived"` | S-01「アーカイブ」タブ | 「戻す」ボタン |
| `"trashed"` | S-01「ごみ箱」タブ | 「復元」ボタン、「完全に削除」ボタン |
| `"readonly"` | S-02 の `DayTaskList` | 操作ボタンなし。タップでタスク編集画面へ遷移するのみ |

表示要素（タイトル、期日、優先度、取り消し線など）は4つの `variant` で共通であり、この共通部分こそが `TaskListItem` を1コンポーネントに統合する理由になる。操作要素は `variant` ごとの条件分岐で出し分け、`onXxx` は該当しない `variant` では渡さない（`undefined` のまま）。

`TaskTabs`（O-01 で選択された「未完了 / アーカイブ / ごみ箱」）の選択状態は、`TaskList` が `variant` を決定する入力になる。8章で「O-01 はコンポーネント分割に影響しない」としていた記述は誤りであり、本節の `variant` 設計を通じて `TaskListItem` の props 構成に直接影響する。8章の記載は修正する。

### 3.4 コンポーネントの責務境界

- **`TaskList` は並び替えのロジックを直接持たない。** 並び替え（F-06 の6規則）は `src/lib/sort.ts` の純粋関数として切り出し、`TaskList` はその関数の戻り値を描画するだけにする。並び替えを単体でテストできるようにするためである
- **`TaskForm` はバリデーションを直接持たない。** バリデーション（要件 6.4）は `src/lib/validation.ts` に切り出し、`TaskForm` はエラーメッセージの表示のみを担当する
- **`TaskForm` はカテゴリ入力候補のロジックを直接持たない。** 保存済みタスクから重複を除いてカテゴリ候補を算出する処理（F-07）は単体テストの対象になりうるため、`CategoryInput.tsx` を `src/components/task/` に独立させ、候補算出そのものは `src/lib/sort.ts` 等と同様に `src/lib/categories.ts` の純粋関数に切り出す。`TaskForm` は `CategoryInput` を呼ぶだけにする
- **`VoiceInputButton` は日付推測のロジックを直接持たない。** ルールベースの日付推測（F-10）は `src/lib/dateKeywords.ts` に切り出す。音声認識の結果もキーボード入力も同じ関数を通すことで、入力手段によって挙動が変わらないようにする

---

## 4. localStorage 読み書きの共通化方針

### 4.1 集約先

localStorage への読み書きは `src/lib/storage.ts` の1ファイルに集約する。**この関数群以外の場所で `localStorage.getItem` / `localStorage.setItem` を直接呼び出すことを禁止する。** コンポーネントは常にこのモジュールの関数を通じてデータを読み書きする。

### 4.2 公開する関数

```typescript
// src/lib/storage.ts

/**
 * 全タスクを読み込む。
 * データが存在しない場合は空配列を返す（F-13）。
 * JSON の解析に失敗した場合は StorageParseError を投げる（F-13）。
 * schemaVersion が現在値より古い場合はマイグレーションしてから返す（F-14）。
 * schemaVersion が現在値より新しい場合は StorageVersionError を投げる（F-14）。
 */
export function loadTasks(): Task[];

/**
 * 全タスクを保存する。
 * 実装時の判断: 当初は500ミリ秒のデバウンスを想定していたが、4.4節の
 * 「各操作が boolean で成否を返す」設計と遅延書き込みは相性が悪いため、
 * 同期的な書き込みに変更した（詳細は src/lib/storage.ts のコメントを参照）。
 * 保存に失敗した場合（容量超過など）は StorageQuotaError を投げる（F-13）。
 */
export function saveTasks(tasks: Task[]): void;

/**
 * 保存されているデータを完全に削除する（F-13 の初期化ボタン用）。
 */
export function clearTasks(): void;
```

`loadTasks` と `saveTasks` は `Task[]` の受け渡しに限定し、`TaskAppData`（`schemaVersion` を含む外側の構造）はこのモジュールの内部に隠す。呼び出し側は `schemaVersion` の存在を意識しない。

### 4.3 エラー型

```typescript
// src/lib/storage.ts

export class StorageParseError extends Error {}
export class StorageVersionError extends Error {}
export class StorageQuotaError extends Error {}
```

呼び出し側（各 `page.tsx`）はこの3つを判別して、要件 F-13 が定める文言をそれぞれ出し分ける。

### 4.4 呼び出しの経路

```
コンポーネント（例: TaskList）
    │
    ▼
カスタムフック useTasks()（src/hooks/useTasks.ts）
    │  loadTasks / saveTasks を呼ぶ。React の状態とデバウンス書き込みをつなぐ
    ▼
src/lib/storage.ts
    │  localStorage.getItem / setItem を呼ぶのはここだけ
    ▼
ブラウザの localStorage
```

`useTasks` フックは次を提供する。

```typescript
// src/hooks/useTasks.ts

export function useTasks() {
  return {
    tasks: Task[],
    isLoading: boolean,
    loadError: StorageParseError | StorageVersionError | null,   // 起動時の読み込み失敗
    lastActionError: StorageQuotaError | null,                    // 直近の書き込み操作の失敗
    addTask: (input: NewTaskInput) => boolean,       // 成功/失敗を返す。失敗時は lastActionError が更新される
    updateTask: (id: string, patch: Partial<Task>) => boolean,
    completeTask: (id: string) => boolean,       // completedAt を現在時刻にする
    uncompleteTask: (id: string) => boolean,      // completedAt を null に戻す
    trashTask: (id: string) => boolean,           // status を trashed にする（F-05）
    restoreTask: (id: string) => boolean,          // status を active に戻す（F-05）
    purgeTask: (id: string) => boolean,             // 完全削除（F-05）
    archiveOverdueTasks: () => void,                 // 起動時のアーカイブ判定（F-04）
    dismissActionError: () => void,                   // lastActionError を消す（通知を閉じる操作）
  };
}
```

**個別操作の失敗を握りつぶさない。** `completeTask` などの各操作は内部で `saveTasks` を呼ぶため、書き込みが失敗する可能性が常にある。以前の設計では戻り値を持たない `void` としていたため、チェックボックスをタップしたのに保存に失敗した場合、UI上はチェック済みに見えるのに実際のデータは未保存、という状態が起こりうる欠陥があった。これを防ぐため、各操作は成功したかどうかを `boolean` で返し、失敗時は React の状態（`tasks`）をタップ前の状態に戻したうえで `lastActionError` を設定する。呼び出し元のコンポーネントはこの `lastActionError` を見て `ErrorState`（`variant="inline"`）を表示する。`loadError`（起動時の読み込み失敗）と `lastActionError`（操作時の書き込み失敗）を型として分けているのは、6章で述べるとおり前者は画面全体を覆う表示、後者は画面を維持したままの通知という異なる見た目に対応させるためである。

**ハイドレーション不一致を避けるための実装パターン。** 2.1節で述べたとおり、localStorage への読み書きは `useEffect` の中でのみ行う。`useTasks` の内部実装は次の形にする。

```typescript
// src/hooks/useTasks.ts の内部実装（要点のみ）

export function useTasks() {
  // サーバー側の初回レンダリングと、クライアント側の初回レンダリングは
  // 必ずこの初期値（空配列・isLoading=true）で一致させる。
  // ここで loadTasks() を直接呼んだり、useState の初期化関数の中で読んだりしてはならない。
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<StorageParseError | StorageVersionError | null>(null);

  useEffect(() => {
    // ここは必ずブラウザ側でのみ実行される（サーバーではこの中身は実行されない）。
    // localStorage への最初のアクセスはここで行う。
    try {
      const loaded = loadTasks();
      setTasks(loaded);
    } catch (e) {
      if (e instanceof StorageParseError || e instanceof StorageVersionError) {
        setLoadError(e);
      } else {
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ...completeTask 等の実装は省略
}
```

この結果、初回のサーバー側レンダリングとクライアント側の初回レンダリング（`useEffect` 実行前）は、どちらも「`tasks` は空配列、`isLoading` は `true`」で一致する。`isLoading` が `true` の間はスケルトンを描画するため、実際のデータの有無によってサーバー・クライアント間の描画内容が食い違うことはない。`useEffect` はハイドレーション完了後に実行されるため、その中で `tasks` を更新して再描画してもハイドレーションエラーにはならない（これは通常の状態更新であり、初回描画の不一致とは別の話である）。

コンポーネントは `useTasks()` のみを使い、`storage.ts` を直接 import しない。これにより「localStorage を触るのは `storage.ts` の外からは行わない」という制約を、フック1つを経由する形で実質的に強制する。

---

## 5. 型定義の置き場所

`docs/data-model.md` の型定義をそのまま `src/types/task.ts` に配置する。

```
src/types/
└── task.ts     # Task, TaskStatus, Priority, TaskAppData
                 # CURRENT_SCHEMA_VERSION, STORAGE_KEY, MAX_LENGTH, DEFAULT_TASK_VALUES
```

型と定数を分けず1ファイルにまとめる。理由は、`Task` 型と `MAX_LENGTH` や `DEFAULT_TASK_VALUES` が強く結びついており、片方だけを変更することがほとんどないためである。ファイルが将来大きくなった場合は `src/types/task.ts` から定数部分を `src/lib/constants.ts` に分離することを検討する（本バージョンでは行わない）。

`src/lib/dates.ts` に、データモデル定義書 1.3 の `toJstDate` と `todayJst` を配置する。この2関数は型ではなく処理なので `src/types/` には置かない。

```
src/lib/
├── storage.ts       # 4章
├── dates.ts          # toJstDate, todayJst（要件 5.1.4）
├── sort.ts            # F-06 の並び替え規則
├── validation.ts       # 6.4 のバリデーション
├── dateKeywords.ts      # F-10 のルールベース日付推測
├── id.ts                # generateId()（データモデル定義書5章）
├── prompt.ts              # F-11, F-12 のプロンプト文組み立て
└── clipboard.ts            # 6.8 のクリップボードフォールバック
```

---

## 6. 空状態とエラー時の表示

### 6.1 空状態（データ0件）

要件 F-06 の受け入れ条件に対応する。`src/components/feedback/EmptyState.tsx` に集約し、`TaskList` から呼び出す。

| 状況 | 表示文言 | 付随する操作 |
| --- | --- | --- |
| 未完了タスクが1件も存在しない（「全体」タブ） | 「タスクがありません」 | タスク追加画面へのボタン |
| 未完了タスクは存在するが、「今日」タブの条件（期日が本日以前、または本日完了）に合致するものがない | 「今日のタスクはありません」 | 「全体」タブに切り替えるボタン |
| アーカイブが0件 | 「アーカイブされたタスクはありません」 | なし |
| ごみ箱が0件 | 「ごみ箱は空です」 | なし |
| カテゴリ絞り込みの結果が0件 | 「該当するタスクがありません」 | 絞り込みを解除するボタン |
| カレンダーで選択した日にタスクが0件 | 「この日の予定はありません」 | なし |

「今日」タブが0件のケースは要件定義書 F-06 の受け入れ条件には明示がないが、未完了タスクの「全体」が0件のケースとは状況が異なる（データはあるが今日に該当しないだけ）ため、同じ文言を出さず別の空状態として扱う。この振る舞いは要件定義書側にも追記することが望ましい。

### 6.2 エラー時の表示

要件 F-13、F-14 に対応する。`src/components/feedback/ErrorState.tsx` に集約する。4.4節で分離した `loadError`（起動時の読み込み失敗）と `lastActionError`（操作時の書き込み失敗）で、表示位置と variant を分ける。

| 発生元 | 型 | 表示文言 | 操作 | `variant` |
| --- | --- | --- | --- | --- |
| `loadError`（起動時） | `StorageParseError`（JSON 破損） | 「保存データを読み込めませんでした」 | 「データを初期化する」ボタン（確認ダイアログ経由で `clearTasks()`） | `"full"` |
| `loadError`（起動時） | `StorageVersionError`（新しすぎる schemaVersion） | 「このアプリのバージョンでは読み込めないデータです」 | なし（要件どおりデータは書き換えない） | `"full"` |
| `lastActionError`（操作時） | `StorageQuotaError`（保存時の容量超過） | 「保存できませんでした。ブラウザの保存容量が上限に達しています」 | フォーム内容は保持したまま表示。`dismissActionError()` で閉じる | `"inline"` |

`saveTasks` が `catch` する書き込み失敗は、`QuotaExceededError`（容量超過）に限らず、プライベートブラウジングでの書き込み拒否や低ストレージ時の例外など複数の原因がありうる。本設計では原因を問わず**書き込みが失敗したという事実**のみを `StorageQuotaError` として扱い、原因ごとの文言分けは行わない。表示文言「保存容量が上限に達しています」は必ずしも実際の原因と一致しない場合があるが、利用者が取れる対処（データを整理する、ブラウザの設定を確認する）はどの原因でも共通であるため、原因の判別は行わずに1種類のエラーへ丸める。

`ErrorState` は S-01 の初期表示位置に置く。`variant="full"` は画面全体を覆い、`variant="inline"` は画面を維持したまま通知のみ表示する。

### 6.3 初期表示中のスケルトン

要件 6.5 の「内容のない白画面を表示しない」に対応する。`useTasks()` の `isLoading` が `true` の間、`TaskList` は本物の行の代わりに `TaskListItem` と同じ寸法のスケルトン（Tailwind の `animate-pulse`）を3件分表示する。この `isLoading` の扱いは2.1節・4.4節で述べたハイドレーション対策と同一のものであり、別の仕組みではない。

---

## 7. 動作確認の手順

要件 6.9 が定める「6.1 の主対象ブラウザで手動により検証する」を、次の手順で行う。

### 7.1 開発サーバーの起動

```bash
npm run dev
```

Turbopack を使う場合は `next dev --turbo`。要件 6.8 のセキュアコンテキスト制約により、スマートフォン実機からアクセスする場合は `http://192.168.x.x:3000` の形になり `navigator.clipboard` と `crypto.randomUUID()` が使えない。この2つが動くかどうかは PC のブラウザで `http://localhost:3000` を開いて確認する（localhost はセキュアコンテキストとみなされる）。実機での見た目とタップ操作の確認は IP アドレス経由で行い、クリップボードは長押しコピーへのフォールバック（6.8）が出ることを確認する。

### 7.2 確認する組み合わせ

要件 6.1 の対応環境表に沿って、次の3系統で確認する。

| 系統 | 確認内容 |
| --- | --- |
| Android Chrome（実機） | 全機能。特に音声入力（F-09）とクリップボード（6.8） |
| デスクトップ Chrome / Edge（`localhost`） | 全機能。特にクリップボードと ID 生成が正常系で動くこと |
| iOS Safari または iOS Chrome（実機、あれば） | 音声入力以外の全機能。マイクボタンが表示されず代替文言が出ること（F-09） |

### 7.3 確認の順序

`docs/requirements.md` の 5章（F-01 から F-14）の受け入れ条件を、番号順に手動でなぞる。1つの受け入れ条件につき、次の3点を確認する。

1. `Given` の状態を作る
2. `When` の操作を行う
3. `Then` の結果になっているか目視で確認する

とくに次の項目は見落としやすいため、確認手順を明記する。

**F-04（自動アーカイブ）の確認**: システム時刻を進める操作ができないため、前日以前の日時で完了済みのタスクを事前に注入してからアプリを開き、アーカイブされることを確認する。4.1節の方針（localStorage への読み書きは `src/lib/storage.ts` に集約する）を動作確認の手順自身が破らないよう、開発者ツールの Console から直接 `localStorage.setItem` を呼ぶのではなく、`storage.ts` に開発専用のシード関数を用意してそれを呼ぶ。

```typescript
// src/lib/storage.ts に追加する開発専用関数
// 本番ビルドでは呼ばれない想定だが、export 自体は行い、Console から呼び出す

export function __devSeedTask(overrides: Partial<Task>): void {
  const tasks = loadTasks();
  tasks.push({ ...DEFAULT_TASK_VALUES, id: generateId(), title: "デバッグ用タスク",
               createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
               ...overrides });
  saveTasks(tasks);
}
```

確認手順は次のとおりになる。

```javascript
// ブラウザの開発者ツール Console から実行する
// window.__devSeedTask は開発ビルドでのみ window に公開する（実装時に導線を用意する）
window.__devSeedTask({ completedAt: "2020-01-01T00:00:00.000Z" });
location.reload();
```

**F-13（JSON 破損）の確認**: これは `storage.ts` が読み込み時に検知すべき壊れ方そのものを再現する必要があるため、例外的に Console から `localStorage.setItem("task-app-data", "{不正なJSON")` を直接実行してよい（`storage.ts` の異常系を試す確認であり、正常系のデータ操作をバイパスするものではない）。リロードして `StorageParseError` の画面が出ることを確認する。

**F-13（容量超過）の確認**: Console から大きな文字列を繰り返し `saveTasks` に渡すテストは行わず、`try { ... } catch` で書き込み失敗を捕捉するコード自体のレビューで代替する。実際に5MBを埋める再現は開発時に毎回行うものではない。

### 7.4 「完了」と報告する前の確認

コードを変更したら、`npm run build` を実行して型エラーとビルドエラーがないことを確認したうえで、7.2 の系統のうち少なくとも1つで実際にブラウザ操作を行う。ビルドが通ることと、ブラウザで意図どおり動くことは別であるため、両方を満たしてから報告する。

```bash
npm run lint    # ESLint によるコード規約チェック
npm run build   # 型チェックとビルド
npm run dev     # 実際にブラウザで操作して確認
```

---

## 8. 未決事項の扱い

要件定義書の未決事項のうち、本設計書は次の判断を行った。判断の根拠を記載する。

| ID | 要件側の内容 | 本設計書での扱い |
| --- | --- | --- |
| O-01 | 3軸の切り替え UI の配置 | `TaskTabs`（今日/全体、未完了/アーカイブ/ごみ箱）と `CategoryFilter` を別コンポーネントとして分離した。画面上での具体的な配置（縦積みか横並びか）はコンポーネント分割には影響しないが、**「未完了/アーカイブ/ごみ箱」のどれが選ばれているかは、3.3節で導入した `TaskListItem` の `variant` props に直接影響する。** この点は前バージョンでは「コンポーネント分割に影響しない」と誤って記載していたため訂正した。`TaskTabs` の選択値を `variant` にマッピングする処理は `TaskList` が持つ |
| O-02 | 貼り付けテキスト欄の配置 | `GeneratePromptButton`（`kind="organize"`）を S-01（タスク一覧）に置く方針で設計した。理由は、要件 US-08 の「会話やメールから貼り付けた」という利用シーンが、新しいタスクを作る前の下準備であり、タスク追加画面（S-03）に入る前の一覧画面で完結させたほうが動線が短いため。この判断は暫定であり、使ってみて S-03 のほうが自然であれば移動する |

O-11（実機端末）、O-13（音声入力の外部通信許容）は本設計書の構成そのものには影響しない。iOS の場合は `VoiceInputButton` が非表示分岐（要件 F-09 の受け入れ条件）を通るだけで、コンポーネント自体は変わらない。O-13 で音声入力を廃止する場合は `src/components/voice/` ディレクトリごと削除し、`TaskForm` からの参照を外す。

O-07（カレンダーでの時刻の見せ方）、O-08（期限切れタスクの見せ方）は `MonthCalendar` と `TaskListItem` の見た目の微調整であり、コンポーネントの新規作成や削除を伴わないため、実装時に決定してよい。

O-12（保存キーの分割）、O-14（自動テストの導入）は本バージョンでは採用しない前提で設計した。O-12 を採用する場合は `src/lib/storage.ts` の内部実装のみの変更で済み、`useTasks()` 以降のインターフェースは変わらない。
