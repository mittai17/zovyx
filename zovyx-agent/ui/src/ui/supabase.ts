import { createClient } from "@supabase/supabase-js";

// Uses Vite env variables. Ensure you create a .env file in zuvix/ui/ with these keys.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
