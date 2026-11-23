"use client";
// "use client" means this component runs in the browser, so it can hold state
// and respond to typing and clicks.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  // useState gives a component a field that re-draws the screen when it changes.
  // `const [email, setEmail]` is array destructuring: the value and its setter.
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stop the browser from reloading the page
    setStatus("sending");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Where the emailed link sends the user back to. See auth/callback/route.ts.
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  // The HTML-looking syntax below is JSX. It compiles to plain function calls,
  // and `{...}` drops a JavaScript expression into the markup.
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg border border-black/10 p-6 dark:border-white/15">
        <h1 className="text-xl font-semibold">Defense Contract Finance</h1>
        <p className="mt-1 text-sm opacity-70">
          Sign in with a one-time link sent to your email.
        </p>

        {status === "sent" ? (
          <p className="mt-6 text-sm" role="status">
            Check <strong>{email}</strong> for a sign-in link. Open it in this
            same browser.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="rounded border border-black/20 bg-transparent px-3 py-2 text-sm dark:border-white/25"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
