import type { Metadata } from "next";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "タスク管理",
  description: "1人用のタスク管理アプリケーション",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
