import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Paths that never need an auth check
const PUBLIC_PATHS = ["/login", "/auth"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Let public paths through — login page, auth callback, etc.
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return response;
  }

  // Not logged in → go to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const onboarded = user.user_metadata?.onboarding_completed === true;

  // Logged in but not onboarded → go to onboarding (unless already there)
  if (!onboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Already onboarded → don't let them re-enter the wizard
  if (onboarded && pathname === "/onboarding") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
