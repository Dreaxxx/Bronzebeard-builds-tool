"use client";
import { useI18n, type Lang } from "@/lib/i18n/store";
import { Select } from "./ui";
const options: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'sv', label: 'Svenska' },
];
export default function LangSwitcher(){
  const { lang, setLang } = useI18n();
  return (
    <Select value={lang} onChange={e=>{ const v=e.target.value as Lang; setLang(v); try{ localStorage.setItem('bbr_lang', v);}catch{} }}>
      {options.map(o=>(<option key={o.code} value={o.code}>{o.label}</option>))}
    </Select>
  );
}
