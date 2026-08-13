# Khan Group of PG

A hostel and PG management platform for [aligarhhostel.com](https://www.aligarhhostel.com) —
live room availability for prospective residents, and an admin dashboard for
the people running the property.

## Demo

https://github.com/user-attachments/assets/602bd55c-917c-45b2-b371-ee60dff9ccc7

---

## What it does

Residents and their parents browse rooms with live bed-level availability, add
a bed to a cart, and complete a booking form with the documents required for
check-in. Administrators manage rooms, beds, guests and payments from a
dashboard, and the public availability display updates from the same data.

**Today, bookings are confirmed manually.** Guests submit a booking, the admin
team confirms it over a call or WhatsApp, and availability is updated from the
dashboard. Online payment capture is the next milestone.

### Features

- Live room and bed availability, computed from bookings rather than a manual flag
- Multi-step booking flow with document upload and a digital agreement
- Admin dashboard: rooms, beds, guests, users, transactions, revenue trend
- Role-based access control with a `guest` / `admin` role on the user record
- Invoice generation and email notifications
- Structured data and per-route metadata for local search

---

## Tech stack

| Layer         | Choice                                      |
| ------------- | ------------------------------------------- |
| Framework     | Next.js 14 (App Router, Server Actions)     |
| Language      | TypeScript (strict)                         |
| Database      | Supabase Postgres via Drizzle ORM           |
| Auth          | Clerk                                       |
| File storage  | Supabase Storage                            |
| Data fetching | TanStack Query                              |
| UI            | Tailwind CSS + shadcn/ui + Radix primitives |
| Charts        | Recharts                                    |
| Email         | Nodemailer over SMTP                        |
| Testing       | Vitest + React Testing Library              |
| Hosting       | Vercel                                      |

---

## Getting started

**Prerequisites:** Node.js 20+, pnpm 9+, and a Supabase project and Clerk
application (both have free tiers that are enough to run this).

```bash
git clone git@github.com:sayyedarib/hostel-booking-frontend.git
cd hostel-booking-frontend
pnpm install

cp .env.example .env      # then fill in the values
pnpm db:migrate           # apply the schema
pnpm dev                  # http://localhost:3000
```

Every variable is documented in [`.env.example`](./.env.example). Two things
are easy to get wrong:

- **Use a Clerk _development_ instance locally.** Clerk refuses to serve
  production keys (`pk_live_`/`sk_live_`) from `localhost`, and the sign-in
  widget will fail to load with a 400.
- **Prefer Supabase's connection _pooler_ URI** for `DATABASE_URL`. Each
  serverless instance opens its own pool, and the direct-connection limit on
  the free tier is easy to exhaust.

### Scripts

| Command              | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Development server                                |
| `pnpm build`         | Production build                                  |
| `pnpm start`         | Serve the production build                        |
| `pnpm lint`          | ESLint (`next/core-web-vitals`)                   |
| `pnpm typecheck`     | `tsc --noEmit`                                    |
| `pnpm test`          | Unit and component tests                          |
| `pnpm test:watch`    | Tests in watch mode                               |
| `pnpm test:coverage` | Tests with a coverage report                      |
| `pnpm check:env`     | Fails if a server-only env var reaches the client |
| `pnpm db:generate`   | Generate a migration from schema changes          |
| `pnpm db:migrate`    | Apply pending migrations                          |
| `pnpm db:studio`     | Drizzle Studio                                    |

---

## Architecture

```
src/
├── app/                    # App Router routes
│   ├── (dashboard)/        #   admin dashboard + user profile (auth required)
│   ├── (docs)/             #   printable invoice and hostel ID
│   ├── api/                #   route handlers: webhooks, email, invoice PDF
│   └── …                   #   public marketing and booking pages
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── admin/              # dashboard-specific components
│   ├── landing-page/       # marketing sections
│   ├── add-to-cart-drawer/ # booking flow, step 1–5
│   └── agreement-checkout/ # agreement flow, step 2–4
├── config/                 # site identity, routes, FAQ, facilities
├── db/
│   ├── schema.ts           # Drizzle schema — the source of truth
│   ├── queries/            # server actions ("use server")
│   └── internal/           # server-only helpers, NOT exposed as actions
├── interface/              # shared TypeScript types
└── lib/                    # auth, structured data, utilities
```

### Authorization

`src/db/queries/index.ts` carries a top-level `"use server"` directive, which
makes **every export a publicly reachable HTTP endpoint**. Middleware cannot
protect these — a server action can be invoked from any route, including public
ones — so each action authorizes itself:

```ts
export const getUsersData = async () => {
  try {
    await requireAdmin();
    // …
  } catch (error) { /* … */ }
};
```

`src/lib/auth.ts` is the only place that decision is made. It exposes
`requireUser()`, `requireAdmin()` and `resolveTargetUserId()` — the last of
which permits an explicit user id only for admins, so passing someone else's id
to an action cannot read their record.

Anything that must **not** be publicly callable — user provisioning from the
Clerk webhook, for instance — lives in `src/db/internal/` as a plain
`server-only` module rather than an action.

`/admin-dashboard` is additionally gated in its layout, because middleware runs
on the Edge runtime and cannot reach the database to read a role.

### Environment variables

Only `NEXT_PUBLIC_`-prefixed variables reach the browser. `pnpm check:env`
walks the module graph from every `"use client"` file and fails the build if a
server-only variable is read from anywhere the browser can reach it. It runs in
CI on every pull request.

---

## Testing

```bash
pnpm test
```

Vitest with jsdom. Tests live next to the code they cover as `*.test.ts(x)`.
Priority goes to logic where a mistake is expensive: authorization rules, rent
calculation, date-overlap checks, and the bookability rules on a room card.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, the env-leak check, the
test suite and a production build on every pull request and push to `main`.

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Design credits

The landing page design is inspired by
[Wombat's City Hostels](https://www.wombats-hostels.com/) — their layout and
visual presentation were a reference during development. All copy, imagery and
branding are our own.

---

## License

[MIT](./LICENSE)
