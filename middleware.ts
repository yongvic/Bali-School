import { auth } from "@/auth";

export const middleware = auth((req) => {
  const isLoggedIn = !!req.auth;
  const isPublicRoute =
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname === "/about" ||
    req.nextUrl.pathname === "/pricing" ||
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/favicon");

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/signin", req.nextUrl.origin));
  }

  return null;
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
