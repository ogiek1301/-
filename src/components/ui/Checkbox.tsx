"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function Checkbox({ checked, onChange, ariaLabel }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        checked ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M3 8.5L6.5 12L13 4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
