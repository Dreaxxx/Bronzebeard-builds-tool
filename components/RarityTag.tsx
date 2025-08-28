"use client";
import { clsx } from "clsx";

import type { Rarity } from "@/lib/models";
import { colorForRarity, withAlpha } from "@/lib/rarity";

export default function RarityTag({
  rarity,
  className,
  compact = false,
}: {
  rarity?: Rarity;
  className?: string;
  compact?: boolean;
}) {
  const hex = colorForRarity(rarity);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2",
        compact ? "py-0.5 text-[10px]" : "py-0.5 text-xs",
        "font-medium tracking-wide",
        className,
      )}
      style={{
        color: hex,
        backgroundColor: withAlpha(hex, 0.12),
        borderColor: withAlpha(hex, 0.35),
      }}
      title={rarity}
    >
      <i
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: hex }}
      />
      {rarity ?? "—"}
    </span>
  );
}
