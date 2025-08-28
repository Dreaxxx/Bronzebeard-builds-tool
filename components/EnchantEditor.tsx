"use client";

import { useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/store";
import type { Build, Enchant } from "@/lib/models";
import { listEnchants, upsertEnchant, removeEnchant } from "@/lib/storage";

import EnchantRow from "./EnchantRow";
import SearchDrawer from "./SearchDrawer";
import { Button, Input, Label, Card, Select, Textarea } from "./ui";

export default function EnchantEditor({ build }: { build: Build }) {
  const { t } = useI18n();

  const [enchants, setEnchants] = useState<Enchant[]>([]);
  useEffect(() => {
    (async () => setEnchants(await listEnchants(build.id)))();
  }, [build.id]);

  async function add() {
    const name = prompt("Enchant name?");
    if (!name) return;
    await upsertEnchant({
      buildId: build.id,
      name,
      rarity: "Epic" as any,
      slot: "Mystic" as any,
    });
    setEnchants(await listEnchants(build.id));
  }

  async function save(en: Enchant) {
    await upsertEnchant(en);
    setEnchants(await listEnchants(build.id));
  }

  async function del(id: string) {
    if (!confirm("Delete this enchant?")) return;
    await removeEnchant(id);
    setEnchants(await listEnchants(build.id));
  }

  // Recherche Ascension DB pour un enchant donné
  const [openForId, setOpenForId] = useState<string | null>(null);

  // Options de rareté affichées (avec tes couleurs ailleurs via EnchantRow/RarityTag)
  const RARITY_OPTIONS = ["", "Rare", "Epic", "Legendary", "Artifact"] as const;

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{t("enchants.title") ?? "Mystic Enchants"}</h3>
        <Button onClick={add}>+ Enchant</Button>
      </div>

      <div className="space-y-4">
        {enchants.map((en) => (
          <div key={en.id} className="space-y-2">
            {/* Ligne stylée par rareté (couleurs cohérentes) */}
            <EnchantRow
              name={en.name}
              rarity={(en as any).rarity}
              url={en.href || undefined}
              icon={(en as any).icon || undefined}
              notes={undefined /* notes affichées dans l'éditeur en dessous */}
              right={
                <div className="flex gap-2">
                  <Button onClick={() => setOpenForId(en.id)} title="Search in Ascension DB">
                    🔎
                  </Button>
                  <Button onClick={() => del(en.id)} className="text-xs">
                    Delete
                  </Button>
                </div>
              }
            />

            {/* Zone d'édition complète */}
            <Card className="p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Label className="sr-only">Name</Label>
                  <Input value={en.name} onChange={(e) => save({ ...en, name: e.target.value })} />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="w-16">Rarity</Label>
                  <Select
                    value={(en as any).rarity ?? ""}
                    onChange={(e) => save({ ...en, rarity: (e.target.value || null) as any })}
                  >
                    {RARITY_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r || "(Unknown)"}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <Input
                    placeholder="Ascension DB URL (https://db.ascension.gg/...?spell=...)"
                    value={en.href ?? ""}
                    onChange={(e) => save({ ...en, href: e.target.value || null })}
                  />
                  {en.href && (
                    <a className="btn" href={en.href} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Textarea
                    placeholder="Notes / short description"
                    value={en.notes ?? ""}
                    onChange={(e) => save({ ...en, notes: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>
        ))}
        {enchants.length === 0 && (
          <p className="text-sm text-neutral-500">{t("empty.none") ?? "No enchants yet."}</p>
        )}
      </div>

      {openForId && (
        <div className="mt-3">
          <SearchDrawer
            kind="enchants"
            onPick={async (r) => {
              const target = enchants.find((e) => e.id === openForId);
              if (!target) return setOpenForId(null);
              await upsertEnchant({
                ...target,
                name: r.name,
                rarity: (r as any).rarity ?? (target as any).rarity ?? null,
                href: (r as any).href ?? target.href ?? null,
                icon: (r as any).icon ?? (target as any).icon ?? null,
                slot: "Mystic" as any,
              } as any);
              setEnchants(await listEnchants(build.id));
              setOpenForId(null);
            }}
          />
          <div className="mt-2">
            <button className="btn" onClick={() => setOpenForId(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
