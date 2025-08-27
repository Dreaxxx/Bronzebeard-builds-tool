"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Build } from "@/lib/models";
import { getBuild, updateBuild } from "@/lib/storage";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";
import TierEditor from "@/components/TierEditor";
import EnchantEditor from "@/components/EnchantEditor";
import SyncButtons from "@/components/SyncButtons";
import { WOW_CLASSES } from "@/lib/models";
import { useI18n } from "@/lib/i18n/store";

type Tab = "bis" | "enchants" | "settings";

export default function EditBuild() {

  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [build, setBuild] = useState<Build | null>(null);
  const [tab, setTab] = useState<Tab>("bis");

  useEffect(() => { (async () => setBuild(await getBuild(params.id)))(); }, [params.id]);

  if (!build) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><div className="text-sm text-neutral-500">{build.realm} • {build.role}{build.classTag ? ` • ${build.classTag}` : ''}</div><h1 className="text-2xl font-bold">{build.title}</h1></div>
        <a className="btn" href={`/builds/${build.id}/view`}>Public preview</a>
      </div>

      <div>
        <Label>Description (≤ 1000)</Label>
        <Textarea
          maxLength={1000}
          value={build.description ?? ""}
          onChange={e => { setBuild({ ...build, description: e.target.value }); }}
        />
        <p className="text-xs text-neutral-500">{(build.description?.length ?? 0)}/1000</p>
      </div>

      <div className="flex gap-2">
        <button className={"btn " + (tab === "bis" ? "btn-primary" : "")} onClick={() => setTab("bis")}>{t('build.tabs.bis')}</button>
        <button className={"btn " + (tab === "enchants" ? "btn-primary" : "")} onClick={() => setTab("enchants")}>{t('build.tabs.enchants')}</button>
        <button className={"btn " + (tab === "settings" ? "btn-primary" : "")} onClick={() => setTab("settings")}>{t('build.tabs.settings')}</button>
      </div>

      {tab === "bis" && <TierEditor build={build} />}
      {tab === "enchants" && <EnchantEditor build={build} />}
      {tab === "settings" && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grow"><Label>{t('common.title')}</Label><Input value={build.title} onChange={e => { setBuild({ ...build, title: e.target.value }); }} /></div>
              <div className="w-40"><Label>{t('common.role')}</Label><select className="input" value={build.role} onChange={e => { setBuild({ ...build, role: e.target.value as any }); }}>
                <option value="Caster/Range">Caster/Range</option><option value="Melee">Melee</option><option value="Tank">Tank</option><option value="Healer">Healer</option>
              </select></div>
              <div className="w-48"><Label>{t('common.class')}</Label><Select value={build.classTag ?? ''} onChange={e => { setBuild({ ...build, classTag: e.target.value }); }}>
                {WOW_CLASSES.map(c => (<option key={c} value={c}>{c}</option>))}
              </Select></div>
            </div>
            <div><Label>{t('build.settings.order')}</Label><Input value={build.tiers.join(",")} onChange={e => setBuild({ ...build, tiers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) as any })} /></div>
            <div className="space-y-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={build.isPublic} onChange={e => { setBuild({ ...build, isPublic: e.target.checked }); }} /><span>{t('common.public')}?</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" disabled={!build.isPublic} checked={build.commentsEnabled} onChange={e => { setBuild({ ...build, commentsEnabled: e.target.checked }); }} /><span>{t('form.enableComments')}</span></label>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={async () => { await updateBuild(build.id, build); alert("Saved."); }}>{t('common.save')}</Button>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold mb-2">Cloud sync</h3>
              <p className="text-sm text-neutral-500 mb-2">Sign in with Discord.</p>
              <SyncButtons build={build} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
