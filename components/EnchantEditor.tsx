"use client";
import { useEffect, useMemo, useState } from "react";
import type { Build, Enchant, Rarity } from "@/lib/models";
import { listEnchants, upsertEnchant, removeEnchant } from "@/lib/storage";
import { Button, Input, Label, Card, Row, Select, Textarea } from "./ui";
import SearchDrawer from "./SearchDrawer";

const RARITIES: Rarity[] = ["Rare", "Epic", "Legendary", "Artifact"];

export default function EnchantEditor({ build }: { build: Build }) {
  const [enchants, setEnchants] = useState<Enchant[]>([]);
  const [quota, setQuota] = useState({ total: 11, Rare: 6, Epic: 3, Legendary: 1, Artifact: 1 });
  useEffect(() => { (async () => setEnchants(await listEnchants(build.id)))(); }, [build.id]);

  async function add() { const name = prompt("Enchant name ?"); if (!name) return; await upsertEnchant({ buildId: build.id, name, rarity: "Epic", slot: "Mystic" }); setEnchants(await listEnchants(build.id)); }
  async function save(en: Enchant) { await upsertEnchant(en); setEnchants(await listEnchants(build.id)); }
  async function del(id: string) { if (!confirm("Delete this enchant ?")) return; await removeEnchant(id); setEnchants(await listEnchants(build.id)); }

  const counts = useMemo(() => enchants.reduce((m, e) => { (m.total++), (m as any)[e.rarity] = ((m as any)[e.rarity] || 0) + 1; return m; }, { total: 0, Artifact: 0, Rare: 0, Epic: 0, Legendary: 0 } as any), [enchants]);
  const over = { total: counts.total > quota.total, Artifact: counts.Artifact > quota.Artifact, Rare: counts.Rare > quota.Rare, Epic: counts.Epic > quota.Epic, Legendary: counts.Legendary > quota.Legendary };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div><span className="badge">Total: {counts.total}/{quota.total}</span></div>
          {RARITIES.map(r => (<div key={r}><span className={"badge " + (over[r] ? "border-red-500 text-red-600" : "")}>{r}: {counts[r]}/{(quota as any)[r]}</span></div>))}
          <div className="ml-auto flex gap-2">
            <Button onClick={add}>+ Enchant</Button>
            <Button onClick={() => { const div = document.getElementById('ench-search'); if (div) div.scrollIntoView({ behavior: 'smooth' }); }}>🔎</Button>
          </div>
        </div>
        <p className="text-xs text-neutral-500 mt-2">Adjust quotas if needed (Ascension rules).</p>
      </Card>

      <div id="ench-search">
        <SearchDrawer kind="enchants" onPick={async (r) => {
          await upsertEnchant({ buildId: build.id, name: r.name, rarity: "Epic", slot: "Mystic Enchant", href: r.href });
          setEnchants(await listEnchants(build.id));
        }} />
      </div>

      <div className="grid gap-3">
        {enchants.map(en => (
          <Card key={en.id}>
            <Row>
              <Input value={en.name} onChange={e => save({ ...en, name: e.target.value })} />
              <Select value={en.rarity} onChange={e => save({ ...en, rarity: e.target.value as any })}>{RARITIES.map(r => (<option key={r} value={r}>{r}</option>))}</Select>
              <Input readOnly placeholder="Slot (Mystic/Chest/...)" value={en.slot} onChange={e => save({ ...en, slot: e.target.value })} />
              <Input placeholder="Cost" type="number" value={en.cost ?? 0} onChange={e => save({ ...en, cost: Number(e.target.value) })} />
              <Button onClick={() => del(en.id)}>Delete</Button>
            </Row>
            <Row><Input placeholder="Tags (comma separated)" value={en.tags.join(",")} onChange={e => save({ ...en, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} /></Row>
            <Row><Textarea placeholder="Notes" value={en.notes ?? ""} onChange={e => save({ ...en, notes: e.target.value })} /></Row>
            {en.href && <a className="text-xs underline" href={en.href} target="_blank" rel="noreferrer">Ascension DB</a>}
          </Card>
        ))}
        {enchants.length === 0 && <p className="text-sm text-neutral-500">—</p>}
      </div>
    </div>
  );
}
