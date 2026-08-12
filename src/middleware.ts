import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Routes that require a signed-in user.
 *
 * This is authentication only. Role checks are deliberately *not* done here:
 * middleware runs on the Edge runtime, which cannot reach the database, and a
 * hard-coded allowlist of Clerk user IDs (the previous approach) cannot be
 * changed without a redeploy. `/admin-dashboard` is gated on `role = 'admin'`
 * in its layout, and every admin server action re-checks the role itself —
 * middleware cannot protect server actions, since an action can be invoked
 * from any route including public ones.
 */
const isProtectedRoute = createRouteMatcher([
  "/admin-dashboard(.*)",
  "/user(.*)",
  "/checkout(.*)",
  "/cart(.*)",
  "/agreement-checkout(.*)",
  "/invoice(.*)",
  "/hostel-id(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // `auth().protect()` answers 404 for an unauthenticated visitor; send them to
  // sign-in and back to where they were headed instead.
  if (isProtectedRoute(req) && !auth().userId) {
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
