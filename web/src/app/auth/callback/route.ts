import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The link in the sign-in email lands here as /auth/callback?code=...
// We trade that one-time code for a session, which Supabase stores in cookies,
// then send the user to the home page. A route.ts file is a plain HTTP endpoint
// (like a servlet's doGet), not a page.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Missing, expired or already-used link: back to the login page.
  return NextResponse.redirect(new URL("/login", request.url));
}
