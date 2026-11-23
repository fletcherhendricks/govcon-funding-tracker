import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for code that runs on the server (pages, route handlers, server actions).
// The browser sends its session cookies with every request; this client reads them, so
// every database query runs as the signed-in user and Postgres RLS decides what they see.
//
// `async` + `await` is how JavaScript waits for slow work without blocking, similar to
// calling `.get()` on a Java Future. An async function always returns a Promise.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // `({ name, value, options }) => ...` is an arrow function (a lambda) whose
            // parameter is "destructured": it pulls three fields out of each cookie object.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Pages are not allowed to set cookies while rendering. That is fine:
            // proxy.ts refreshes the session cookies on every request instead.
          }
        },
      },
    },
  );
}
