"use client";

import { useEffect, useMemo, useState } from "react";

import BuildForm from "@/components/BuildForm";
import BuildCard from "@/components/builds/BuildCard";

import { useI18n } from "@/lib/i18n/store";
import type { Build } from "@/lib/models";
import { listBuilds, createBuild } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";

import type { Session } from "@supabase/supabase-js";

type Tab = "my" | "saved";

export default function HomePage() {
  const [all, setAll] = useState<Build[]>([]);
  const [tab, setTab] = useState<Tab>("my");
  const [session, setSession] = useState<Session | null>(null);
  const { t } = useI18n();

  // Charger tous les builds locaux (Dexie)
  useEffect(() => {
    (async () => setAll(await listBuilds()))();
  }, []);

  // Suivre l'auth pour filtrer "mes builds"
  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  // Mes Builds = (owner cloud == moi) OR (origin local / sans owner)
  const myBuilds = useMemo(
    () =>
      all.filter((b) => (b.ownerId ? b.ownerId === userId : b.origin === "local" || !b.ownerId)),
    [all, userId],
  );

  // Builds locaux sauvegardés (marqués explicitement)
  const savedLocals = useMemo(() => all.filter((b) => b.savedLocal), [all]);

  const list = tab === "my" ? myBuilds : savedLocals;

  function handleDeleted(id: string) {
    setAll((prev) => prev.filter((b) => b.id !== id));
  }

  function handleUnsaved(id: string) {
    // only remove savedLocal flag (keep in "My Builds" if applicable)
    setAll((prev) =>
      prev.map((b) => (b.id === id ? { ...b, savedLocal: false, savedAt: null } : b)),
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Your builds</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("my")}
          style={{ borderColor: "#ffffff2e" }}
          className={`rounded px-3 py-1.5 ${tab === "my" ? "bg-blue-600 text-white" : "bg-grey-600 hover:bg-grey-300 rounded border border-solid"}`}
        >
          My Builds
        </button>
        <button
          onClick={() => setTab("saved")}
          style={{ borderColor: "#ffffff4e" }}
          className={`rounded px-3 py-1.5 ${tab === "saved" ? "bg-blue-600 text-white" : "bg-grey-600 hover:bg-grey-300 rounded border border-solid"}`}
        >
          Saved Locally
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => (
          <BuildCard
            key={b.id}
            build={b}
            variant={tab}
            session={session}
            onDeleted={handleDeleted}
            onUnsaved={handleUnsaved}
          />
        ))}

        {list.length === 0 && (
          <p className="text-sm text-neutral-500">
            {tab === "my" ? "You have no builds yet." : "No locally saved builds yet."}
          </p>
        )}
      </div>

      {/* Create new build */}
      <div>
        <h2 className="mb-2 text-xl font-semibold">{t("home.create")}</h2>
        <BuildForm
          onSubmit={async (data) => {
            const b = await createBuild(data);
            location.href = `/builds/${b.id}/edit`;
          }}
        />
      </div>
    </div>
  );
}
