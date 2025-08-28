"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import EnchantEditor from "@/components/EnchantEditor";
import TierEditor from "@/components/TierEditor";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui";

import { useI18n } from "@/lib/i18n/store";
import { exportBuildBundle, importBuildBundleFile, downloadBlob } from "@/lib/io";
import { WOW_CLASSES } from "@/lib/models";
import type { Build } from "@/lib/models";
import { uploadBuild } from "@/lib/remote";
import { getBuild, listEnchants, listItems, updateBuild } from "@/lib/storage";
import { supabase } from "@/lib/supabaseClient";

import type { Session } from "@supabase/supabase-js";

type Tab = "bis" | "enchants" | "settings";

export default function EditBuild() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const [build, setBuild] = useState<Build | null>(null);
  const [tab, setTab] = useState<Tab>("bis");
  const [tiersInput, setTiersInput] = useState<string>("");

  const [syncing, setSyncing] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sb = supabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub?.subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (build) setTiersInput((build.tiers ?? []).join(", "));
  }, [build, build?.tiers]);

  useEffect(() => {
    (async () => setBuild(await getBuild(params.id)))();
  }, [params.id]);

  async function signInDiscord() {
    const sb = supabase()!;
    await sb.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin },
    });
  }

  function commitTiers(value: string) {
    const parsed = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as Build["tiers"];
    setBuild({ ...build!, tiers: parsed });
  }

  if (!build) return <p>Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500">
            {build.realm} • {build.role}
            {build.classTag ? ` • ${build.classTag}` : ""}
          </div>
          <h1 className="text-2xl font-bold">{build.title}</h1>
        </div>
        <a className="btn" href={`/builds/${build.id}/view`}>
          Public preview
        </a>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file || !build) return;
          try {
            const newId = await importBuildBundleFile(file);
            alert("Build imported locally.");
            router.push(`/builds/${newId}/edit`);
          } catch (err: any) {
            alert(err.message || String(err));
          } finally {
            e.currentTarget.value = "";
          }
        }}
      />

      <div>
        <Label>Description (≤ 3000)</Label>
        <Textarea
          maxLength={3000}
          value={build.description ?? ""}
          onChange={(e) => {
            setBuild({ ...build, description: e.target.value });
          }}
        />
        <p className="text-xs text-neutral-500">{build.description?.length ?? 0}/3000</p>
      </div>

      <div className="flex gap-2">
        <button
          className={"btn " + (tab === "bis" ? "btn-primary" : "")}
          onClick={() => setTab("bis")}
        >
          {t("build.tabs.bis")}
        </button>
        <button
          className={"btn " + (tab === "enchants" ? "btn-primary" : "")}
          onClick={() => setTab("enchants")}
        >
          {t("build.tabs.enchants")}
        </button>
        <button
          className={"btn " + (tab === "settings" ? "btn-primary" : "")}
          onClick={() => setTab("settings")}
        >
          {t("build.tabs.settings")}
        </button>
      </div>

      {tab === "bis" && <TierEditor build={build} />}
      {tab === "enchants" && <EnchantEditor build={build} />}
      {tab === "settings" && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grow">
                <Label>{t("common.title")}</Label>
                <Input
                  value={build.title}
                  onChange={(e) => {
                    setBuild({ ...build, title: e.target.value });
                  }}
                />
              </div>
              <div className="w-40">
                <Label>{t("common.role")}</Label>
                <select
                  className="input"
                  value={build.role}
                  onChange={(e) => {
                    setBuild({ ...build, role: e.target.value });
                  }}
                >
                  <option value="Caster/Range">Caster/Range</option>
                  <option value="Melee">Melee</option>
                  <option value="Tank">Tank</option>
                  <option value="Healer">Healer</option>
                </select>
              </div>
              <div className="w-48">
                <Label>{t("common.class")}</Label>
                <Select
                  value={build.classTag ?? ""}
                  onChange={(e) => {
                    setBuild({ ...build, classTag: e.target.value });
                  }}
                >
                  {WOW_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("build.settings.order")}</Label>
              <Input
                placeholder="Raid, Heroic, P1… (comma separated)"
                value={tiersInput}
                onChange={(e) => setTiersInput(e.target.value)} // on tape librement
                onBlur={(e) => commitTiers(e.currentTarget.value)} // parse au blur
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTiers((e.target as HTMLInputElement).value); // parse sur Enter
                  }
                }}
              />
              <p className="text-xs text-neutral-500">
                {build.tiers.length} tier(s): {build.tiers.join(", ")}
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={build.isPublic}
                  onChange={(e) => {
                    setBuild({ ...build, isPublic: e.target.checked });
                  }}
                />
                <span>{t("common.public")} ?</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={!build.isPublic}
                  checked={build.commentsEnabled}
                  onChange={(e) => {
                    setBuild({ ...build, commentsEnabled: e.target.checked });
                  }}
                />
                <span>{t("form.enableComments")}</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="bg-green-600 hover:bg-green-300"
                onClick={async () => {
                  await updateBuild(build.id, build);
                  alert("Saved.");
                }}
              >
                {t("common.save")}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {/* Export JSON — always visible */}
            <button
              className="rounded bg-orange-600 px-3 py-1.5 hover:bg-orange-300"
              onClick={async () => {
                if (!build) return;
                const blob = await exportBuildBundle(build.id);
                const safe = build.title.replace(/[^\w\-]+/g, "-").slice(0, 60);
                downloadBlob(blob, `${safe || "build"}.json`);
              }}
            >
              Export JSON
            </button>

            {/* Import JSON — always visible */}
            <button
              className="rounded bg-orange-600 px-3 py-1.5 hover:bg-orange-300"
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </button>

            {/* Sync cloud — only visible if logged in */}
            {session ? (
              <button
                className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                onClick={async () => {
                  try {
                    setSyncing(true);

                    const itemsNow = (
                      await Promise.all((build.tiers ?? []).map((t) => listItems(build.id, t)))
                    ).flat();

                    const enchantsNow = await listEnchants(build.id);

                    await uploadBuild(build, itemsNow, enchantsNow);
                    alert("Synced to cloud.");
                  } catch (e: any) {
                    alert(e.message || String(e));
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={syncing}
              >
                {syncing ? "Syncing…" : "Sync to cloud"}
              </button>
            ) : (
              // User is not logged in
              <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                <p className="font-semibold">Login required to sync</p>
                <p>Sign in with Discord to upload your build to the cloud.</p>
                <button
                  onClick={signInDiscord}
                  className="mt-2 rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                >
                  Sign in with Discord
                </button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
