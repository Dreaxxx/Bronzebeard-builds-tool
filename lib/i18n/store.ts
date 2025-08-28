"use client";
import { create } from "zustand";

import de from "./translations/de.json";
import en from "./translations/en.json";
import es from "./translations/es.json";
import fr from "./translations/fr.json";
import ru from "./translations/ru.json";
import sv from "./translations/sv.json";
import zh from "./translations/zh.json";

export type Lang = "en" | "es" | "fr" | "de" | "ru" | "zh" | "sv";
type Dict = Record<string, string>;
type State = { lang: Lang; dict: Dict; setLang: (l: Lang) => void; t: (k: string) => string };

const DICTS: Record<Lang, Dict> = { en, es, fr, de, ru, zh, sv };

export const useI18n = create<State>((set, get) => ({
  lang: "en",
  dict: DICTS["en"],
  setLang: (l) => set({ lang: l, dict: DICTS[l] }),
  t: (k) => get().dict[k] ?? k,
}));
