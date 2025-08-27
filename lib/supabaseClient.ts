"use client";
import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
let _sb: ReturnType<typeof createClient> | null = null;
export function supabase(){ if(!_sb && supabaseUrl && supabaseAnon) _sb=createClient(supabaseUrl, supabaseAnon, { auth:{persistSession:true,autoRefreshToken:true} }); return _sb; }
