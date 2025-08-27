"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getBuild, listItems, listEnchants, likeLocal, putBuildDeep } from "@/lib/storage";
import type { Build, Tier } from "@/lib/models";
import { Card, Button, Pill } from "@/components/ui";
import { SLOTS } from "@/lib/slots";
import CommentThread from "@/components/CommentThread";
import { likePublicBuild, fetchBuildBundleFromCloud } from "@/lib/remote";
import { useI18n } from "@/lib/i18n/store";

export default function ViewBuild() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [build, setBuild] = useState<Build | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [enchants, setEnchants] = useState<any[]>([]);
  const [liking, setLiking] = useState(false);

  useEffect(() => { (async () => { const b = await getBuild(params.id); if (b) { setBuild(b); setTier(b.tiers[0]); } })(); }, [params.id]);
  useEffect(() => { (async () => { if (!build || !tier) return; setItems(await listItems(build.id, tier)); setEnchants(await listEnchants(build.id)); })(); }, [build, tier]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      let b = await getBuild(params.id);
      if (!cancelled && b) { setBuild(b); return; }

      try {
        const bundle = await fetchBuildBundleFromCloud(params.id);
        if (!bundle) { if (!cancelled) setError("Build not found or not public."); return; }
        await putBuildDeep(bundle); // hydrate local pour les sous-composants
        if (!cancelled) setBuild(bundle.build);
      } catch (e: any) {
        if (!cancelled) setError(e.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  const itemsBySlot = useMemo(() => { const m: Record<string, any[]> = {}; (SLOTS as any).forEach((s: string) => m[s] = []); for (const it of items) (m[it.slot] || []).push(it); Object.keys(m).forEach(s => m[s].sort((a, b) => a.rank - b.rank)); return m; }, [items]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!build) return <p>Loading…</p>;

  async function like() {
    const b = build;
    if (!b || !b.isPublic) return;

    try {
      setLiking(true);
      await likeLocal(b.id);
      try { await likePublicBuild(b.id); } catch { }
      const updated = await getBuild(b.id);
      if (updated) setBuild(updated);
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><div className="text-sm text-neutral-500">{build.realm} • {build.role}{build.classTag ? ` • ${build.classTag}` : ''}</div><h1 className="text-2xl font-bold">{build.title}</h1></div>
        <div className="flex items-center gap-2">
          <Pill>❤️ {build.likes || 0}</Pill>
          {build.isPublic && <Button disabled={liking} onClick={like}>{t('like.add')}</Button>}
          <a className="btn" href={`/builds/${build.id}/edit`}>{t('common.edit')}</a>
        </div>
      </header>

      <Card><div className="flex flex-wrap items-center gap-2">{build.tiers.map(ti => (<button key={ti} className={"badge " + (tier === ti ? "border-blue-500" : "")} onClick={() => setTier(ti)}>{ti}</button>))}</div></Card>

      {build.description && (
        <Card><p className="whitespace-pre-wrap text-sm">{build.description}</p></Card>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">BiS — {tier}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {(SLOTS as any).map((slot: string) => (
            <Card key={slot}>
              <h3 className="font-semibold">{slot}</h3>
              <ul className="mt-2 space-y-1">
                {(itemsBySlot[slot] || []).map(it => (
                  <li key={it.id} className="text-sm">
                    <span className="badge mr-2">{it.rank === 1 ? "BiS" : `Alt ${it.rank}`}</span>
                    <span className="font-medium">{it.name}</span>
                    {it.source && <span className="text-neutral-500"> — {it.source}</span>}
                    {it.notes && <div className="text-xs text-neutral-500">{it.notes}</div>}
                    {it.href && <div><a className="text-xs underline" href={it.href} target="_blank" rel="noreferrer">Ascension DB</a></div>}
                  </li>
                ))}
                {(itemsBySlot[slot] || []).length === 0 && <li className="text-sm text-neutral-500">{t('empty.none')}</li>}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Mystic Enchants</h2>
        <Card>
          <ul className="grid md:grid-cols-2 gap-2">
            {enchants.map(en => (
              <li key={en.id} className="text-sm">
                <span className="badge mr-2">{en.rarity}</span>
                <span className="font-medium">{en.name}</span>
                {en.slot && <span className="text-neutral-500"> • {en.slot}</span>}
                {en.tags?.length > 0 && <span className="text-neutral-500"> • {en.tags.join(", ")}</span>}
                {typeof en.cost === "number" && <span className="text-neutral-500"> • cost {en.cost}</span>}
                {en.notes && <div className="text-xs text-neutral-500">{en.notes}</div>}
                {en.href && <div><a className="text-xs underline" href={en.href} target="_blank" rel="noreferrer">Ascension DB</a></div>}
              </li>
            ))}
            {enchants.length === 0 && <li className="text-sm text-neutral-500">{t('empty.none')}</li>}
          </ul>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t('build.comments')}</h2>
        {build.isPublic && build.commentsEnabled ? (<CommentThread build={build} />) : (<div className="text-sm text-neutral-500">{t('build.comments.disabled')}</div>)}
      </section>
    </div>
  );
}
