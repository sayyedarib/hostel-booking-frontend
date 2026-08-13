# Security, correctness, performance and content pass across the app

14 commits. Each is self-contained and explains the specific defect it fixes —
worth reading the individual messages rather than just this summary.

## Start here: a live data-exposure issue

`src/db/queries/index.ts` carried a top-level `"use server"` directive, so **all
58 exports were publicly reachable HTTP endpoints**, and 36 had no authorization
at all. Middleware cannot cover these — a server action can be invoked from any
route, including public ones.

Anyone on the internet could call:

- `getUsersData()` — every user's name, email and phone
- `getUserDataById(anyId)` — any user's DOB, Aadhaar/ID document URLs, guardian
  document URLs, signature and home address
- `deleteGuest(anyId)` — delete any guest record
- `updateUserData(userId, field, value)` — write any column on any row
- `updateUserIdImage(...)` and siblings — overwrite anyone's identity documents
- `getAnalyticsData()` / `getRevenueAndBookingsData()` — revenue figures

Fixed by putting the decision in one place (`src/lib/auth.ts`: `requireUser`,
`requireAdmin`, `resolveTargetUserId`) and gating every action.

**Because the exposure was live, rotating the Supabase and Clerk credentials
after merge is worth considering.**

Role-based access replaces the three Clerk user IDs hardcoded in middleware, via
a `role` column (migration `drizzle/0001`, already applied — 2 admins seeded;
the third hardcoded ID has no user row).

## Correctness

- **Room availability contradicted itself.** The card ignored the
  `bed.available` admin flag and only looked at bookings covering today; the
  drawer honoured the flag and used a 15-day window. 31 of 52 beds are flagged
  unavailable with no booking, so rooms advertised "2 available" with an enabled
  button, and the drawer then showed every bed greyed out — a dead end
  mid-booking.
- **The dashboard charts were shadcn demo data** ("1,125 Visitors",
  "January – June 2024") while the real query ran and was discarded. The revenue
  query also bucketed by month *name*, collapsing July 2025 into July 2026, and
  required a bed-booking status that no row in production has — so it could
  never have shown anything.
- **Deleting a guest had no confirmation.** One click, no undo.
- Guest dates were formatted without a year: a stay of 4 Aug 2026 → 1 Jan 2027
  displayed as "Aug 4 → Jan 1".

## Broken routes

`/robots.txt` 404'd (file named `robot.ts`), `/favicon.ico` returned 500
(conflicting public/app files), all seven footer links pointed at routes that do
not exist, and `/analytics` rendered the string `hello`. An abandoned second
auth system (Supabase email/password at `/login` and `/signup`) ran alongside
Clerk.

## Content

`/room-facilities` was the design reference's copy with "Wombat's"
find-replaced to "Aligarh's" — advertising luggage storage for backpackers, a
guest kitchen, a bar, "50 international HOSCARS awards" and "Since 1999", with
the reference brand's own SVG icons checked into `public/`. Rewritten around
what the property actually offers. `/seo` was a keyword-stuffed doorway page;
rebuilt as a real guide.

## Performance

| Route                 | Before | After  |
| --------------------- | ------ | ------ |
| `/rooms`              | 477 kB | 319 kB |
| `/rooms/[roomid]`     | 451 kB | 294 kB |
| `/cart`               | 378 kB | 299 kB |
| `/agreement-checkout` | 412 kB | 333 kB |

`public/` drops from ~17.7 MB to 3.9 MB. Eleven unused dependencies removed.

## Groundwork

Vitest + RTL with 70 tests; CI running lint, typecheck, env-leak check, tests
and build; rewritten README and CONTRIBUTING; the 2,200-line query module split
by domain.

## Action needed after merge

1. **Rename the env vars in Vercel**: `NEXT_PUBLIC_DATABASE_URL` →
   `DATABASE_URL`, `NEXT_PUBLIC_CLERK_WEBHOOK_SECRET` → `CLERK_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_EMAIL_USR` → `EMAIL_USER`, `NEXT_PUBLIC_EMAIL_PWD` →
   `EMAIL_PASSWORD`. The old names still work as a fallback, so nothing breaks
   if this waits.
2. `EMAIL_PASSWORD` is missing from the local `.env` (it had `EMAIL_USER`
   twice) — check Vercel has it.
3. The property name in the database reads "Campus View Appartment" (typo) and
   shows on every room card.
