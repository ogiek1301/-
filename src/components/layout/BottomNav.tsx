"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "タスク" },
  { href: "/calendar", label: "カレンダー" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 flex border-t border-gray-200 bg-white">
      {ITEMS.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center justify-center py-3 text-xs font-medium ${
              isActive ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
