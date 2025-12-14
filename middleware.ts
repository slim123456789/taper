// middleware.ts (Root of your project)
import { type NextRequest } from "next/server";
// CHANGE THIS LINE: Use the full relative path starting with ./src
import { updateSession } from "./src/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};