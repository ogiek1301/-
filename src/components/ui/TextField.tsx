"use client";

import { useId, type ChangeEvent } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  error,
  multiline = false,
  type = "text",
  placeholder,
}: TextFieldProps) {
  const id = useId();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const baseClasses = `w-full rounded-lg border px-3 py-2 text-base ${
    error ? "border-red-500" : "border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className={baseClasses}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
