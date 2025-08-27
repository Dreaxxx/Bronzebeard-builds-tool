"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listBuilds, createBuild, deleteBuild } from "@/lib/storage";
import type { Build } from "@/lib/models";
import BuildForm from "@/components/BuildForm";
import { Button, Card, Pill } from "@/components/ui";
import { useI18n } from "@/lib/i18n/store";

export default function Page() {
  const { t } = useI18n();
  const [builds, setBuilds] = useState<Build[]>([]);
  async function refresh() { setBuilds(await listBuilds()); }
  useEffect(() => { refresh(); }, []);

  async function createDefault() {
    const b = await createBuild({ title: "New build", realm: "BronzeBeard", role: "Caster/Range", classTag: "Mage", tiers: ["Raid", "M0", "M+<10", "M+10-14", "M+15+"], isPublic: false, commentsEnabled: false });
    location.href = `/builds/${b.id}/edit`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.yourBuilds')}</h1>
        <Button onClick={createDefault}>+ {t('home.newQuick')}</Button>
      </div>

      {builds.length === 0 && (<Card><p className="text-sm text-neutral-600 dark:text-neutral-300">No builds yet.</p></Card>)}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {builds.map(b => (
          <Card key={b.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-neutral-500">{b.realm} • {b.role}{b.classTag ? ` • ${b.classTag}` : ''}</div>
                <h3 className="text-lg font-semibold">{b.title}</h3>
                <div className="text-xs mt-1">{t('form.visibility')}: {b.isPublic ? t('common.public') : t('common.private')}</div>
              </div>
              <Pill>❤️ {b.likes || 0}</Pill>
            </div>
            <div className="flex gap-2 mt-3">
              <Link className="btn" href={`/builds/${b.id}/view`}>{t('common.view')}</Link>
              <Link className="btn" href={`/builds/${b.id}/edit`}>{t('common.edit')}</Link>
              <button className="btn" onClick={async () => { if (confirm('Delete this build?')) { await deleteBuild(b.id); await refresh(); } }}>{t('common.delete')}</button>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">{t('home.create')}</h2>
        <BuildForm onSubmit={async (data) => { const b = await createBuild(data); location.href = `/builds/${b.id}/edit`; }} />
      </div>
    </div>
  );
}
