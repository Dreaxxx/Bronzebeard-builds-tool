import type { Rarity } from "./models";

export const RARITY_COLORS_HEX: Record<string, string> = {
  Rare: "#0070dd",
  Epic: "#a335ee",
  Legendary: "#ff8000",
  Artifact: "#e5cc80",
};

export function colorForRarity(r: Rarity | undefined): string {
  if (!r) return "#9ca3af";
  return RARITY_COLORS_HEX[r] ?? "#9ca3af";
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "");
  const n = parseInt(
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m,
    16,
  );
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function withAlpha(hex: string, a: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
