"use client";
import { useEffect } from "react";
import { useI18n, type Lang } from "@/lib/i18n/store";
const supported: Lang[] = ['en','es','fr','de','ru','zh','sv'];
export default function LanguageInit(){
  const { setLang } = useI18n();
  useEffect(()=>{
    try{
      const saved = localStorage.getItem("bbr_lang") as Lang | null;
      if (saved && supported.includes(saved)) { setLang(saved); return; }
      const nav = (navigator.language || 'en').toLowerCase();
      const pick: Lang =
        nav.startsWith('fr') ? 'fr' :
        nav.startsWith('es') ? 'es' :
        nav.startsWith('de') ? 'de' :
        nav.startsWith('ru') ? 'ru' :
        nav.startsWith('zh') ? 'zh' :
        nav.startsWith('sv') ? 'sv' : 'en';
      setLang(pick);
      localStorage.setItem("bbr_lang", pick);
    }catch{}
  }, [setLang]);
  return null;
}
