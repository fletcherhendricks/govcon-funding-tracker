import { createBrowserClient } from "@supabase/ssr";

// Supabase client for code that runs in the browser (files marked "use client").
// It talks to Supabase directly as the signed-in user; the session lives in cookies.
//
// `export function` is like a `public static` method in Java: other files import it by name.
// The `!` after each env var tells TypeScript "trust me, this is not undefined".
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
