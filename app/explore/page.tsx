"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Build } from "@/lib/models";
import { listBuilds } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";
import { Card, Select } from "@/components/ui";
import { useI18n } from "@/lib/i18n/store";

type SortKey = "updatedAt" | "createdAt" | "likes" | "classTag";

export default function Explore() {
  const { t } = useI18n();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [classFilter, setClassFilter] = useState<string>("");

  useEffect(()=>{
    (async ()=>{
      const sb = supabase();
      if (sb) {
        const { data } = await sb.from("builds").select("*").eq("is_public", true).limit(1000);
        if (data) {
          const mapped = (data as any[]).map(b => ({ id:b.id, title:b.title, realm:b.realm, role:b.role, classTag:b.class_tag ?? undefined, tiers:b.tier_order, createdAt: Date.parse(b.created_at), updatedAt: Date.parse(b.updated_at), likes: b.likes || 0, isPublic: b.is_public, commentsEnabled: (b as any).comments_enabled ?? false }));
          setBuilds(mapped as any); return;
        }
      }
      const local = (await listBuilds()).filter((b:any)=>b.isPublic);
      setBuilds(local as any);
    })();
  }, []);

  const classes = useMemo(()=> Array.from(new Set(builds.map(b=>b.classTag).filter(Boolean))) as string[], [builds]);

  const sorted = useMemo(()=>{
    let arr = builds.filter(b => (classFilter ? (b.classTag===classFilter) : true));
    arr = [...arr].sort((a,b)=>{
      if (sortKey === 'likes') return (b.likes||0) - (a.likes||0);
      if (sortKey === 'classTag') return (a.classTag||'').localeCompare(b.classTag||'');
      if (sortKey === 'createdAt') return (b.createdAt||0) - (a.createdAt||0);
      return (b.updatedAt||0) - (a.updatedAt||0);
    });
    return arr;
  }, [builds, sortKey, classFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('explore.title')}</h1>
        <div className="flex items-center gap-2">
          <Select value={classFilter} onChange={e=>setClassFilter(e.target.value)}>
            <option value="">{t('explore.filter.class')}</option>
            {classes.map(c=> (<option key={c} value={c}>{c}</option>))}
          </Select>
          <Select value={sortKey} onChange={e=>setSortKey(e.target.value as SortKey)}>
            <option value="updatedAt">{t('explore.sort.updated')}</option>
            <option value="createdAt">{t('explore.sort.created')}</option>
            <option value="likes">{t('explore.sort.likes')}</option>
            <option value="classTag">{t('explore.sort.class')}</option>
          </Select>
        </div>
      </div>

      {sorted.length===0 && <Card><p className="text-sm text-neutral-500">No public builds yet.</p></Card>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(b => (
          <Card key={b.id}>
            <div className="text-sm text-neutral-500">{b.realm} • {b.role}{b.classTag?` • ${b.classTag}`:''}</div>
            <h3 className="text-lg font-semibold">{b.title}</h3>
            <div className="text-xs text-neutral-500 mt-1">❤️ {b.likes||0} • {t('common.created')} {new Date(b.createdAt).toLocaleDateString()} • {t('common.updated')} {new Date(b.updatedAt).toLocaleDateString()}</div>
            <div className="flex gap-2 mt-3">
              <Link className="btn" href={`/builds/${b.id}/view`}>{t('common.view')}</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
