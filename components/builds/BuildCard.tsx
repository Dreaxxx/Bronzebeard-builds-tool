// components/builds/BuildCard.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Pill } from "@/components/ui";

import type { Build } from "@/lib/models";
import { deleteBuildEverywhere, deleteBuildLocal, unmarkBuildSavedLocally } from "@/lib/storage";

import { TrashIcon } from "../icons";

import type { Session } from "@supabase/supabase-js";

type Props = {
  build: Build;
  variant: "my" | "saved";
  session: Session | null;
  onDeleted: (id: string) => void; // retirer complètement de la liste (quand on delete local/copie)
  onUnsaved?: (id: string) => void; // juste retirer du "Saved" (en gardant dans "My")
};

export default function BuildCard({ build, variant, session, onDeleted, onUnsaved }: Props) {
  const [busy, setBusy] = useState(false);
  const userId = session?.user.id ?? null;

  const isOwned = useMemo(
    () => !!build.ownerId && build.ownerId === userId,
    [build.ownerId, userId],
  );
  const isLocal = useMemo(
    () => build.origin === "local" || !build.ownerId,
    [build.origin, build.ownerId],
  );

  async function handlePrimaryAction() {
    try {
      setBusy(true);

      if (variant === "saved") {
        // 🔹 Remove from Saved Locally
        if (isOwned || isLocal) {
          // on conserve le build en local, on retire juste le flag
          await unmarkBuildSavedLocally(build.id);
          onUnsaved?.(build.id); // > la carte disparaît de l'onglet "Saved", reste visible dans "My"
          alert("Removed from Saved.");
        } else {
          // build d’autrui sauvé localement → on peut supprimer la copie locale
          await deleteBuildLocal(build.id);
          onDeleted(build.id);
          alert("Removed local copy.");
        }
        return;
      }

      // 🔸 Onglet "My" → Delete
      const alsoCloud = isOwned && !!userId;
      const msg = alsoCloud
        ? "Delete this build from cloud AND local?"
        : "Delete this build locally only? (Sign in as owner to delete from cloud)";
      if (!confirm(msg)) return;

      await deleteBuildEverywhere(build.id, alsoCloud);
      onDeleted(build.id);
      alert(alsoCloud ? "Deleted from cloud and local." : "Deleted locally.");
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  const canEdit = variant === "my" && (isOwned || isLocal);

  return (
    <div className="relative rounded-xl border p-4">
      <div className="absolute right-2 top-2 flex gap-2">
        <button
          onClick={handlePrimaryAction}
          disabled={busy}
          className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
        >
          {busy ? (
            variant === "saved" ? (
              "Removing…"
            ) : (
              "Deleting…"
            )
          ) : variant === "saved" ? (
            <TrashIcon className="h-4 w-4" />
          ) : (
            <TrashIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <h3 className="line-clamp-1 font-semibold">{build.title}</h3>
      <div className="mt-1">
        <Pill>❤️ {build.likes || 0}</Pill>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {build.realm} • {build.role}
        {build.classTag ? ` • ${build.classTag}` : ""}
      </p>
      {build.description && (
        <p className="mt-2 line-clamp-3 text-sm text-neutral-600">{build.description}</p>
      )}

      <div className="mt-3 flex gap-2">
        <Link
          href={`/builds/${build.id}/view`}
          className="rounded bg-green-500 px-3 py-1.5 hover:bg-green-600"
        >
          View
        </Link>

        {canEdit ? (
          <Link
            href={`/builds/${build.id}/edit`}
            className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
          >
            Edit
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded bg-neutral-200 px-3 py-1.5 opacity-50">
            Edit
          </span>
        )}
      </div>
    </div>
  );
}
