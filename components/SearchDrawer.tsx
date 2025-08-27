"use client";
import { useState } from 'react';
import { Button, Input, Card } from './ui';
import { useI18n } from '@/lib/i18n/store';

type Result = { id: string; type: 'item' | 'spell'; name: string; href: string; quality?: string; ilvl?: number; slotText?: string };

export default function SearchDrawer({ kind, onPick, slotSuggestion }: { kind: 'items' | 'enchants'; onPick: (r: Result) => void; slotSuggestion?: string; }) {
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [source, setSource] = useState('');
  const [advOpen, setAdvOpen] = useState(false);
  const [quality, setQuality] = useState<string>('');
  const [slot, setSlot] = useState<string>(slotSuggestion || '');
  const [ilvlMin, setIlvlMin] = useState<string>('');
  const [ilvlMax, setIlvlMax] = useState<string>('');

  async function search() {
    if (!q.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const params = new URLSearchParams({ q, type: kind });
      if (kind === 'items') {
        if (quality) params.set('quality', quality);
        if (slot) params.set('slot', slot);
        if (ilvlMin) params.set('ilvlMin', ilvlMin);
        if (ilvlMax) params.set('ilvlMax', ilvlMax);
      }
      const res = await fetch(`/api/ascension/search?${params.toString()}`);
      const json = await res.json();
      setResults(json.results || []);
      setSource(json.source || '');
    } finally { setLoading(false); }
  }

  const placeholder = kind === 'items' ? t('search.placeholder.items') : t('search.placeholder.enchants');
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Input placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') search(); }} />
        <Button onClick={search}>{t('search.useDb')}</Button>
        {source && <a className="btn" href={source} target="_blank" rel="noreferrer">{t('search.openDb')}</a>}
      </div>

      {kind === 'items' && (
        <div className="mt-3">
          <button className="btn" onClick={() => setAdvOpen(v => !v)}>{advOpen ? '▲ Hide filters' : '▼ Advanced filters'}</button>
          {advOpen && (
            <div className="mt-2 grid md:grid-cols-4 gap-2">
              <select className="input" value={quality} onChange={e => setQuality(e.target.value)}>
                <option value="">Quality — Any</option>
                <option value="Artifact">Artifact</option>
                <option value="Rare">Rare</option>
                <option value="Epic">Epic</option>
                <option value="Legendary">Legendary</option>
              </select>
              <input className="input" placeholder="Slot contains… (ex: Head)" value={slot} onChange={e => setSlot(e.target.value)} />
            </div>
          )}
        </div>
      )}

      <div className="mt-3 space-y-2">
        {loading && <div className="text-sm text-neutral-500">Loading…</div>}
        {!loading && results.map(r => (
          <div key={`${r.type}-${r.id}`} className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-800 p-2">
            <div className="text-sm"><span className="font-medium">{r.name}</span> <span className="text-neutral-500">({r.type} #{r.id})</span>{r.quality && <span className="badge ml-2">{r.quality}</span>}{typeof r.ilvl === 'number' && <span className="badge ml-2">ilvl {r.ilvl}</span>}{r.slotText && <span className="badge ml-2">{r.slotText}</span>}</div>
            <div className="flex items-center gap-2">
              <a className="btn" href={r.href} target="_blank" rel="noreferrer">{t('search.openDb')}</a>
              <button className="btn" onClick={() => onPick(r)}>{t('search.add')}</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
