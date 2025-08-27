import "./globals.css";
import type { Metadata } from "next";
import AuthBar from "@/components/AuthBar";
import LangSwitcher from "@/components/LangSwitcher";
import LanguageInit from "@/components/LanguageInit";

export const metadata: Metadata = {
  title: "BronzeBeard Ready — v4.1.1",
  description: "i18n + Ascension DB search + filters",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="container py-3 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="text-lg font-semibold">🛡️ BronzeBeard Ready</a>
              <a href="/explore" className="btn">Explore</a>
              <span className="text-xs text-neutral-500">Local-first prototype</span>
            </div>
            <div className="flex items-center gap-2">
              <LangSwitcher />
              {/* auto-detect & persist language */}
              <LanguageInit />
              <AuthBar />
            </div>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="container py-6 text-xs text-neutral-500">Local data (IndexedDB). Optional cloud via Supabase.</footer>
      </body>
    </html>
  );
}
