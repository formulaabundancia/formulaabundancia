import { createClient } from "@supabase/supabase-js";

// Fallback de build: si .env.local no está configurado todavía (antes de que
// Jose pegue sus credenciales reales), esto permite que `next build` complete
// igualmente. En producción sin las variables reales, las llamadas a Supabase
// fallarán en tiempo de ejecución, no en build.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(url, anonKey);
