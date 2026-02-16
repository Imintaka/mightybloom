import type { Metadata } from "next";
import { MainNav } from "@/components/layout/MainNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Трекер привычек",
  description: "MVP трекер привычек и дел",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-b from-rose-100 via-pink-50 to-white text-rose-900 antialiased">
        <header className="sticky top-0 z-10 border-b border-rose-200/70 bg-rose-50/90 backdrop-blur">
          <MainNav />
        </header>
        {children}
      </body>
    </html>
  );
}
