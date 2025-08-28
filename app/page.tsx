"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { Build } from "@/lib/models";
import { listBuilds, deleteBuildEverywhere, createBuild } from "@/lib/storage";
import BuildForm from "@/components/BuildForm";
import { useI18n } from "@/lib/i18n/store";
import { Pill } from "@/components/ui";


export default function HomePage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { t } = useI18n();

  // Charger les builds locaux
  useEffect(() => {
    (async () => {
      const data = await listBuilds();
      setBuilds(data);
    })();
  }, []);

  // Suivre l’état d’auth pour savoir si on peut supprimer côté cloud
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function handleDelete(id: string) {
    const alsoCloud = !!session; // connecté ? on tente cloud+local, sinon local only
    const msg = alsoCloud
      ? "Delete this build from cloud AND local?"
      : "Delete this build locally only? (Sign in to delete from cloud)";
    if (!confirm(msg)) return;

    try {
      setDeletingId(id);
      const cloud = await deleteBuildEverywhere(id, alsoCloud);
      // Retirer la card immédiatement
      setBuilds(prev => prev.filter(b => b.id !== id));
      alert(
        cloud
          ? "Deleted from cloud and local."
          : alsoCloud
            ? "Could not delete in cloud (not owner or not found). Deleted locally."
            : "Deleted locally."
      );
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Your builds</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {builds.map(b => (
          <div key={b.id} className="relative rounded-2xl border p-4">
            {/* Actions en haut à droite */}
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => handleDelete(b.id)}
                disabled={deletingId === b.id}
                className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                title="Delete"
              >
                {deletingId === b.id ? "Deleting…" : "Delete"}
              </button>
            </div>

            <h3 className="font-semibold line-clamp-1">{b.title}</h3>
            <Pill>❤️ {b.likes || 0}</Pill>
            <p className="text-sm text-neutral-500">
              {b.realm} • {b.role}{b.classTag ? ` • ${b.classTag}` : ""}
            </p>
            {b.description && (
              <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{b.description}</p>
            )}

            <div className="mt-3 flex gap-2">
              <Link href={`/builds/${b.id}/view`} className="px-3 py-1.5 rounded bg-orange-600 hover:bg-orange-300">
                View
              </Link>
              <Link href={`/builds/${b.id}/edit`} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">
                Edit
              </Link>
            </div>
          </div>
        ))}

        {builds.length === 0 && (
          <p className="text-sm text-neutral-500">No builds yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">{t('home.create')}</h2>
        <BuildForm onSubmit={async (data) => { const b = await createBuild(data); location.href = `/builds/${b.id}/edit`; }} />
      </div>
    </div>
  );
}

