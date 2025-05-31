import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin-dashboard(.*)",
  "/checkout(.*)",
  "/cart(.*)",
  "/agreement-checkout(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!auth().userId && isProtectedRoute(req)) {
    // Add custom logic to run before redirecting

    return auth().redirectToSignIn();
  }
  if (
    req.nextUrl.pathname.startsWith("/admin-dashboard") &&
    !(
      auth().userId === "user_2sVvqEHglWzpu32MQycvhl14rYD" ||
      auth().userId === "user_2sTm6Ig2B2WC7MYsc79Gf712Em8" ||
      auth().userId === "user_2n9mnloqLf2QogRf5dXBc3kVvm4"
    )
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
