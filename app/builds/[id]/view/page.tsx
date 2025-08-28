"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CommentThread from "@/components/CommentThread";
import EnchantRow from "@/components/EnchantRow";
import { Card, Button, Pill } from "@/components/ui";

import { useI18n } from "@/lib/i18n/store";
import type { Build, BuildItem, Enchant, Tier } from "@/lib/models";
import { likePublicBuild, fetchBuildBundleFromCloud, putBuildDeep } from "@/lib/remote";
import { SLOTS } from "@/lib/slots";
import {
  getBuild,
  listItems,
  listEnchants,
  likeLocal,
  markBuildSavedLocally,
  unmarkBuildSavedLocally,
} from "@/lib/storage";

export default function ViewBuild() {
  const { t } = useI18n();

  const params = useParams<{ id: string }>();

  const [build, setBuild] = useState<Build | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [items, setItems] = useState<BuildItem[]>([]);
  const [enchants, setEnchants] = useState<Enchant[]>([]);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const b = await getBuild(params.id);
      if (b) {
        setBuild(b);
        setTier(b.tiers[0]);
      }
    })();
  }, [params.id]);

  useEffect(() => {
    (async () => {
      if (!build || !tier) return;
      setItems(await listItems(build.id, tier));
      setEnchants(await listEnchants(build.id));
    })();
  }, [build, tier]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      const b = await getBuild(params.id);
      if (!cancelled && b) {
        setBuild(b);
        return;
      }

      try {
        const bundle = await fetchBuildBundleFromCloud(params.id);
        if (!bundle) {
          if (!cancelled) setError("Build not found or not public.");
          return;
        }
        await putBuildDeep(bundle); // hydrate local pour les sous-composants
        if (!cancelled) setBuild(bundle.build);
      } catch (e: any) {
        if (!cancelled) setError(e.message || String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const itemsBySlot = useMemo(() => {
    const m: Record<string, BuildItem[]> = {};
    SLOTS.forEach((s: string) => (m[s] = []));
    for (const it of items) (m[it.slot] || []).push(it);
    Object.keys(m).forEach((s) => m[s].sort((a, b) => a.rank - b.rank));
    return m;
  }, [items]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!build) return <p>Loading…</p>;

  async function like() {
    const b = build;
    if (!b || !b.isPublic) return;

    try {
      setLiking(true);
      await likeLocal(b.id);
      try {
        await likePublicBuild(b.id);
      } catch {}
      const updated = await getBuild(b.id);
      if (updated) setBuild(updated);
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setLiking(false);
    }
  }

  async function saveLocal() {
    try {
      setSaving(true);
      await markBuildSavedLocally(build!.id);
      setBuild({ ...build!, savedLocal: true, savedAt: Date.now() });
    } finally {
      setSaving(false);
    }
  }
  async function removeSaved() {
    if (!confirm("Remove from saved?")) return;
    await unmarkBuildSavedLocally(build!.id);
    setBuild({ ...build!, savedLocal: false, savedAt: null });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500">
            {build.realm} • {build.role}
            {build.classTag ? ` • ${build.classTag}` : ""}
          </div>
          <h1 className="text-2xl font-bold">{build.title}</h1>
        </div>
        <div className="flex gap-2">
          {!build.savedLocal ? (
            <button
              onClick={saveLocal}
              disabled={saving}
              className="rounded bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700"
              title="Save this build locally"
            >
              {saving ? "Saving…" : "Save locally"}
            </button>
          ) : (
            <button
              onClick={removeSaved}
              className="rounded bg-orange-500 px-3 py-1.5 hover:bg-orange-600"
              title="Remove from saved"
            >
              Saved ✓ (remove)
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Pill>❤️ {build.likes || 0}</Pill>
          {build.isPublic && (
            <Button disabled={liking} onClick={like}>
              {t("like.add")}
            </Button>
          )}
          <a className="btn" href={`/builds/${build.id}/edit`}>
            {t("common.edit")}
          </a>
        </div>
      </header>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {build.tiers.map((ti) => (
            <button
              key={ti}
              className={"badge " + (tier === ti ? "border-blue-500" : "")}
              onClick={() => setTier(ti)}
            >
              {ti}
            </button>
          ))}
        </div>
      </Card>

      {build.description && (
        <Card>
          <p className="whitespace-pre-wrap text-sm">{build.description}</p>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">BiS — {tier}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {SLOTS.map((slot: string) => (
            <Card key={slot}>
              <h3 className="font-semibold">{slot}</h3>
              <ul className="mt-2 space-y-1">
                {(itemsBySlot[slot] || []).map((it) => (
                  <li key={it.id} className="text-sm">
                    <span className="badge mr-2">{it.rank === 1 ? "BiS" : `Alt ${it.rank}`}</span>
                    <span className="font-medium">{it.name}</span>
                    {it.source && <span className="text-neutral-500"> — {it.source}</span>}
                    {it.notes && <div className="text-xs text-neutral-500">{it.notes}</div>}
                    {it.href && (
                      <div>
                        <a
                          className="text-xs underline"
                          href={it.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ascension DB
                        </a>
                      </div>
                    )}
                  </li>
                ))}
                {(itemsBySlot[slot] || []).length === 0 && (
                  <li className="text-sm text-neutral-500">{t("empty.none")}</li>
                )}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Mystic Enchants</h2>
        <Card>
          <ul className="grid gap-2 md:grid-cols-2">
            {enchants.map((en) => (
              <EnchantRow
                key={en.id}
                name={en.name}
                rarity={en.rarity}
                url={en.href || undefined}
                notes={en.notes || undefined}
              />
            ))}

            {enchants.length === 0 && (
              <li className="text-sm text-neutral-500">{t("empty.none")}</li>
            )}
          </ul>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">{t("build.comments")}</h2>
        <p className="flex items-center gap-2 text-sm text-neutral-500">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="#f59e42" strokeWidth="2" fill="#fffbe6" />
            <rect x="9" y="6" width="2" height="6" rx="1" fill="#f59e42" />
            <rect x="9" y="13" width="2" height="2" rx="1" fill="#f59e42" />
          </svg>
          Comments are only for local usage. Noone else can see them.
        </p>
        {build.isPublic && build.commentsEnabled ? (
          <CommentThread build={build} />
        ) : (
          <div className="text-sm text-neutral-500">{t("build.comments.disabled")}</div>
        )}
      </section>
    </div>
  );
}
