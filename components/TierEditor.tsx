"use client";
import { useEffect, useMemo, useState } from "react";
import { SLOTS } from "@/lib/slots";
import type { Build, BuildItem, Slot, Tier } from "@/lib/models";
import { listItems, upsertItem, removeItem } from "@/lib/storage";
import { Button, Input, Label, Card, Select, Textarea } from "./ui";
import { useI18n } from "@/lib/i18n/store";
import SearchDrawer from "./SearchDrawer";

export default function TierEditor({ build }: { build: Build }) {
  const { t } = useI18n();
  const [tier, setTier] = useState<Tier>(build.tiers[0]);
  const [items, setItems] = useState<BuildItem[]>([]);
  useEffect(()=>{ (async ()=> setItems(await listItems(build.id, tier)))(); }, [build.id, tier]);

  async function addItem(slot: Slot){ const name = prompt(`Item name for ${slot}?`); if(!name) return; await upsertItem({ buildId: build.id, slot, tier, name, rank: 1 }); setItems(await listItems(build.id, tier)); }
  async function saveItem(it: BuildItem){ await upsertItem(it); setItems(await listItems(build.id, tier)); }
  async function del(id: string){ if(!confirm("Delete this item?")) return; await removeItem(id); setItems(await listItems(build.id, tier)); }

  const bySlot = useMemo(()=>{ const m: Record<string, BuildItem[]> = {}; (SLOTS as any).forEach((s:string)=>m[s]=[]); for(const it of items){ (m[it.slot] = m[it.slot] || []).push(it); } Object.keys(m).forEach(s=>m[s].sort((a,b)=>a.rank-b.rank)); return m; }, [items]);
  const [openSlot, setOpenSlot] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-56"><Label>Tier</Label><Select value={tier} onChange={e=>setTier(e.target.value as Tier)}>{build.tiers.map(t=>(<option key={t} value={t}>{t}</option>))}</Select></div>
        <div className="text-sm text-neutral-500">{t('slot.clickAdd')}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(SLOTS as any).map((slot:Slot)=>(
          <Card key={slot}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{slot}</h3>
              <div className="flex gap-2">
                <Button onClick={()=>addItem(slot)}>+ Item</Button>
                <Button onClick={()=>setOpenSlot(slot)}>🔎</Button>
              </div>
            </div>
            <div className="space-y-3">
              {(bySlot[slot]||[]).map(it => (
                <div key={it.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={it.name} onChange={e=>saveItem({ ...it, name: e.target.value })} />
                    <div className="w-20"><Label className="sr-only">Rank</Label>
                      <Input type="number" min={1} value={it.rank} onChange={e=>saveItem({ ...it, rank: Number(e.target.value) })} />
                    </div>
                    <Button onClick={()=>del(it.id)}>{'Delete'}</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Source (dungeon/key/chest)" value={it.source ?? ""} onChange={e=>saveItem({ ...it, source: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Textarea placeholder='Notes or stats (ex: {"SP":52,"Haste":28})' value={it.notes ?? ""} onChange={e=>saveItem({ ...it, notes: e.target.value })} />
                  </div>
                  {it.href && <a className="text-xs underline" href={it.href} target="_blank" rel="noreferrer">Ascension DB</a>}
                </div>
              ))}
              {(bySlot[slot]||[]).length===0 && <p className="text-sm text-neutral-500">{t('empty.none')}</p>}
            </div>
            {openSlot===slot && (
              <div className="mt-3">
                <SearchDrawer kind="items" slotSuggestion={slot} onPick={async (r)=>{
                  await upsertItem({ buildId: build.id, slot, tier, name: r.name, rank: 1, href: r.href });
                  setItems(await listItems(build.id, tier)); setOpenSlot(null);
                }} />
                <div className="mt-2"><button className="btn" onClick={()=>setOpenSlot(null)}>Close</button></div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
