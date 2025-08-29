import "./globals.css";
import Image from "next/image";

import AuthBar from "@/components/AuthBar";
import LangSwitcher from "@/components/LangSwitcher";
import LanguageInit from "@/components/LanguageInit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BronzeBeard Builds Manager v0.8.5",
  description: "i18n + Ascension DB search + filters",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/app-icon-192.png",
    other: [{ rel: "mask-icon", url: "/app-icon-maskable-512.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="container flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <a href="/" className="text-lg font-semibold">
                <Image
                  src="/app-icon-128.png"
                  width={128}
                  height={128}
                  alt="Bronzebeard emblem"
                  className="inline-block"
                  priority
                />
                BronzeBeard Builds Manager
              </a>
              <a href="/explore" className="btn">
                Explore
              </a>
              <span className="text-xs text-neutral-500">Beta Version</span>
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
        <footer className="container py-6 text-xs text-neutral-500">
          Created by Topaze, inspired by Bronzebeard. All data from{" "}
          <a href="https://db.ascension.gg/" target="_blank" rel="noreferrer">
            Ascension
          </a>
          . Icons by{" "}
          <a href="https://www.flaticon.com/authors/freepik" target="_blank" rel="noreferrer">
            Freepik
          </a>{" "}
          and{" "}
          <a href="https://www.flaticon.com/authors/smashicons" target="_blank" rel="noreferrer">
            Smashicons
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
