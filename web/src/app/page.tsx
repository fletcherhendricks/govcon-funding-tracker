import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// No "use client" here, so this is a server component: it runs on the server,
// can `await` data directly, and sends finished HTML to the browser.
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already redirects signed-out visitors; this is a second check.
  if (!user) {
    redirect("/login");
  }

  // A server action: a function the browser can call by submitting a form.
  // Next.js turns it into an HTTP POST behind the scenes.
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Defense Contract Finance</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded border border-black/20 px-3 py-1.5 text-sm dark:border-white/25"
          >
            Sign out
          </button>
        </form>
      </header>

      <p className="mt-8 text-sm">
        Signed in as <strong>{user.email}</strong>
      </p>
      <p className="mt-2 text-sm opacity-70">
        The contract portfolio will appear here once the database is built.
      </p>
    </main>
  );
}
