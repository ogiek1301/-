"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:text-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50",
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
