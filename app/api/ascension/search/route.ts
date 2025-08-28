import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

type Res = {
  id: string;
  type: "item" | "spell";
  name: string;
  href: string;
  quality?: string;
  ilvl?: number;
  slotText?: string;
};

function mapQuality(cls: string | undefined): string | undefined {
  if (!cls) return undefined;
  const m = cls.match(/q(\d)/);
  if (!m) return undefined;
  const q = Number(m[1]);
  if (q === 2) return "Artifact";
  if (q === 3) return "Rare";
  if (q === 4) return "Epic";
  if (q === 5) return "Legendary";
  return undefined;
}

function parseNearby(text: string): { ilvl?: number; slotText?: string } {
  const il = /(?:Item Level|Ilvl|iLvl)\s*(\d{1,3})/i.exec(text);
  const slot =
    /(Head|Neck|Shoulder|Back|Chest|Wrist|Hands|Waist|Legs|Feet|Ring|Trinket|Weapon|Off[- ]?hand|Ranged|Tabard)/i.exec(
      text,
    );
  return { ilvl: il ? Number(il[1]) : undefined, slotText: slot ? slot[1] : undefined };
}

function parseResults(html: string): Res[] {
  const results: Res[] = [];
  const re = /(<a[^>]*href="\/(?:\?item=(\d+)[^"]*)"[^>]*>([^<]+)<\/a>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const full = m[1];
    const id = m[2];
    const name = m[3].trim();
    const href = `https://db.ascension.gg/?item=${id}`;
    const classM = full.match(/class\s*=\s*"([^"]+)"/i);
    const quality = mapQuality(classM ? classM[1] : undefined);
    const tail = html.slice(m.index, Math.min(m.index + m[0].length + 300, html.length));
    const ctx = parseNearby(tail);
    if (name && id && !results.find((r) => r.id === id && r.type === "item"))
      results.push({
        id,
        type: "item",
        name,
        href,
        quality,
        ilvl: ctx.ilvl,
        slotText: ctx.slotText,
      });
  }
  const spellRe = /href="\/(?:\?spell=(\d+)[^"]*)"[^>]*>([^<]+)<\/a>/g;
  let s: RegExpExecArray | null;
  while ((s = spellRe.exec(html))) {
    const id = s[1];
    const name = s[2].trim();
    const href = `https://db.ascension.gg/?spell=${id}`;
    if (name && id && !results.find((r) => r.id === id && r.type === "spell"))
      results.push({ id, type: "spell", name, href });
  }
  return results.slice(0, 100);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const kind = (searchParams.get("type") || "items").trim(); // 'items' | 'enchants'
  const slot = (searchParams.get("slot") || "").trim();
  const quality = (searchParams.get("quality") || "").trim();
  const ilvlMin = Number(searchParams.get("ilvlMin") || "0") || 0;
  const ilvlMax = Number(searchParams.get("ilvlMax") || "0") || 0;

  if (!q) return NextResponse.json({ results: [] });

  const encoded = encodeURIComponent(q);
  const base = "https://db.ascension.gg/";

  const urlSearch = `${base}?search=${encoded}${kind === "enchants" ? "&spells=" : "&items="}`;

  const urlFilter = `${base}?filter=na%3D${encoded}${kind === "enchants" ? "&spells=" : "&items="}`;

  try {
    let res = await fetch(urlSearch, { headers: { "User-Agent": "Mozilla/5.0 BronzeBeardReady" } });
    let text = await res.text();

    if (!text || text.length < 3000) {
      res = await fetch(urlFilter, { headers: { "User-Agent": "Mozilla/5.0 BronzeBeardReady" } });
      text = await res.text();
    }

    let results = parseResults(text).filter(
      (r) => r.type === (kind === "enchants" ? "spell" : "item"),
    );

    if (kind === "items") {
      if (quality) results = results.filter((r) => !quality || r.quality === quality);
      if (slot)
        results = results.filter(
          (r) =>
            !slot || (r.slotText ? r.slotText.toLowerCase().includes(slot.toLowerCase()) : true),
        );
      if (ilvlMin)
        results = results.filter((r) =>
          typeof r.ilvl === "number" ? (r.ilvl as number) >= ilvlMin : true,
        );
      if (ilvlMax)
        results = results.filter((r) =>
          typeof r.ilvl === "number" ? (r.ilvl as number) <= ilvlMax : true,
        );
    }

    // expose l’URL de recherche (sera utilisée par “Open in DB” dans l’UI)
    return NextResponse.json({ results, source: urlSearch });
  } catch (e: any) {
    return NextResponse.json({ results: [], error: String(e), source: urlSearch }, { status: 200 });
  }
}
