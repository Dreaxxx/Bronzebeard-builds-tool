"use client";
import type { Rarity } from "@/lib/models";
import { colorForRarity, withAlpha } from "@/lib/rarity";

import RarityTag from "./RarityTag";

export type EnchantRowProps = {
  name: string;
  rarity?: Rarity;
  url?: string | null;
  icon?: string | null;
  notes?: string | null;
  right?: React.ReactNode;
};

export default function EnchantRow({ name, rarity, url, icon, notes, right }: EnchantRowProps) {
  const hex = colorForRarity(rarity);
  return (
    <div
      className="group flex items-start gap-3 rounded-xl border p-3 transition-colors"
      style={{
        borderColor: "rgb(38,38,38)",
        background: withAlpha(hex, 0.06),
        boxShadow: `inset 3px 0 0 0 ${hex}`,
      }}
    >
      <div className="pt-0.5">
        {icon ? (
          <img
            src={icon}
            alt=""
            className="h-8 w-8 rounded border border-neutral-700"
            loading="lazy"
          />
        ) : (
          <div
            className="h-8 w-8 rounded border"
            style={{ borderColor: withAlpha(hex, 0.35), backgroundColor: withAlpha(hex, 0.12) }}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{name}</div>
          <RarityTag rarity={rarity as any} compact />
        </div>
        {notes && <p className="mt-1 line-clamp-2 text-sm text-neutral-300">{notes}</p>}
        {url && (
          <a
            href={url}
            target="_blank"
            className="mt-1 inline-block text-xs underline opacity-80 hover:opacity-100"
            style={{ color: hex }}
          >
            Open in DB →
          </a>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
