import type { Metadata } from "next";
import { MainNav } from "@/components/layout/MainNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "MightyBloom",
  description: "MightyBloom — трекер привычек и дел со стикерами",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru">
      <body className="min-h-screen text-rose-900 antialiased">
        <header className="sticky top-0 z-20 border-b border-rose-200/60 bg-white/70 backdrop-blur-md">
          <MainNav />
        </header>
        {children}
      </body>
    </html>
  );
}
