"use client";

interface CategoryInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  error?: string;
}

/**
 * F-07 のカテゴリ入力欄。自由入力に加え、過去に使ったカテゴリを候補として出す（O-06）。
 * ネイティブの datalist を使うことで、候補にない文字列の直接入力と、候補のタップ入力を
 * 同じ input 要素だけで両立させる。
 */
export function CategoryInput({ value, onChange, suggestions, error }: CategoryInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700" htmlFor="category-input">
        カテゴリ
      </label>
      <input
        id="category-input"
        list="category-suggestions"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例: 仕事"
        className={`w-full rounded-lg border px-3 py-2 text-base ${
          error ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      />
      <datalist id="category-suggestions">
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
