"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

/** F-07 のカテゴリ絞り込み。選択肢は呼び出し元が getAvailableCategoryFilters で算出して渡す。 */
export function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
          selected === null ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
        }`}
      >
        すべて
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            selected === category ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
