// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
export const supabase = () =>
    createClient<Database>(supabaseUrl!, supabaseAnon!, { auth: { persistSession: true, autoRefreshToken: true } });
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;