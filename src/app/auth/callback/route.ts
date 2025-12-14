import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // SUCCESS: Redirect to home
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      // FAILURE: Log the exact error to your terminal
      console.error("❌ Auth Callback Error:", error.message);
    }
  } else {
    console.error("❌ Auth Callback Error: No code provided in URL");
  }

  // Redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}