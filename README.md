# BronzeBeard Builds Manager — v0.8.5

- i18n (EN default + ES/FR/DE/RU/ZH/SV), auto-detection on first load, persisted.
- Ascension DB search (items & enchants) with **advanced filters** (quality, slot text).
- Local-first (IndexedDB/Dexie). Optional cloud sync (Supabase).

## Dev

```bash
npm i
npm run dev
# http://localhost:3000
```

## Troubleshooting

If you see `Element type is invalid. Received a promise...` or Next complains about version:

1. Use the pinned Next: `next@14.2.5` (package.json already pins it).
2. Clean install:

```bash
rm -rf node_modules package-lock.json .next
npm i
npm run dev
```

3. If still stuck: `npm i next@14.2.5 --save-exact`.

## Environment

Copy `.env.local.example` → `.env.local` if you use Supabase.
