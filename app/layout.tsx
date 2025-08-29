import "./globals.css";
import Image from "next/image";

import AuthBar from "@/components/AuthBar";
import LangSwitcher from "@/components/LangSwitcher";
import LanguageInit from "@/components/LanguageInit";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BronzeBeard Builds Manager v0.8.5",
  description: "Build manager for gear and Mystic Enchants - With Ascension database search",
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
      <body className="min-h-screen">
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[hsl(var(--bg))]/80 backdrop-blur dark:border-neutral-800">
          <div className="container py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <a href="/" className="flex min-w-0 items-center gap-3">
                  <Image
                    src="/app-icon-128.png"
                    width={64}
                    height={64}
                    sizes="(min-width:1024px) 56px, (min-width:768px) 48px, 40px"
                    alt="Bronzebeard emblem"
                    className="h-10 w-10 shrink-0 rounded md:h-12 md:w-12 lg:h-14 lg:w-14"
                    priority
                  />
                  <span className="truncate text-base font-semibold leading-tight sm:text-lg md:max-w-[40vw] md:text-xl lg:max-w-none">
                    BronzeBeard Builds Manager
                  </span>
                </a>
                <span className="hidden text-xs text-neutral-500 md:inline">Beta Version</span>
              </div>

              <nav className="hidden items-center gap-2 md:flex">
                <a href="/explore" className="btn btn-ghost">
                  Explore Builds List
                </a>
              </nav>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <LangSwitcher />
                <LanguageInit />
                <AuthBar />
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 md:hidden">
              <a href="/explore" className="btn w-full justify-center">
                Explore Builds List
              </a>
              <span className="text-xs text-neutral-500">Beta</span>
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
