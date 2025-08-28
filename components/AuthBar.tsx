"use client";
import { useEffect, useState } from "react";

import { authGetUser, signInDiscord, signOut } from "@/lib/remote";

import { Button } from "./ui";

import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function AuthBar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  async function refresh() {
    try {
      setUser(await authGetUser());
    } catch {
      setUser(null);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  if (!user)
    return (
      <Button
        onClick={async () => {
          try {
            await signInDiscord();
          } catch (e) {
            alert(String(e));
          }
        }}
      >
        Sign in (Discord)
      </Button>
    );
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        Signed in as{" "}
        <span className="font-medium">
          {user.user_metadata?.full_name || user.email || user.id}
        </span>
      </span>
      <button
        className="btn"
        onClick={async () => {
          await signOut();
          await refresh();
        }}
      >
        Sign out
      </button>
    </div>
  );
}
