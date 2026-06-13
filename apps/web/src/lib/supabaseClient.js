// Supabase Client Initialization
// Falls back gracefully if Supabase environment variables or packages are missing.

export let supabase = null;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey) {
  const packageName = '@supabase/supabase-js';
  // Use variable and vite-ignore to completely bypass Vite static analysis
  import(/* @vite-ignore */ packageName)
    .then(({ createClient }) => {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('[Supabase] Client initialized successfully.');
    })
    .catch((err) => {
      console.warn('[Supabase] Failed to load @supabase/supabase-js package.', err);
    });
} else {
  console.log('[Supabase] Credentials missing. Running in local fallback mode.');
}
