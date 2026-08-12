# Contributing

Thanks for taking the time to contribute. This document covers how to get set
up, what the code should look like, and what has to pass before a change lands.

## Getting set up

See [Getting started](./README.md#getting-started) in the README. In short:

```bash
pnpm install
cp .env.example .env      # fill in your own values
pnpm db:migrate
pnpm dev
```

Use a Clerk **development** instance locally — production keys are rejected on
`localhost`.

## Before you open a pull request

All five must pass. CI runs the same commands, so running them locally first
saves a round trip:

```bash
pnpm lint
pnpm typecheck
pnpm check:env
pnpm test
pnpm build
```

## Branches and commits

Branch off `main`:

```
feat/bed-availability-filter
fix/invoice-total-rounding
chore/upgrade-drizzle
docs/booking-flow
```

Commit messages: a short imperative subject line (~72 characters), then a body
explaining **why** the change is needed. If you fixed a bug, say what the
symptom was — that context is what makes the history worth reading.

```
Fix rent total when a stay crosses a month boundary

A 45-day stay was billed as one month plus 15 days at the daily rate, but the
daily rate was derived from a 30-day month, so the guest was overcharged by
the difference. Rent is now prorated against the actual month length.
```

Don't mention tooling or assistants in commit messages; describe the change.

## Code conventions

**TypeScript.** `strict` is on. Don't reach for `any` — if a type is genuinely
unknown, use `unknown` and narrow it.

**Server actions are public endpoints.** Everything exported from
`src/db/queries/` is reachable over HTTP by anyone. Every action must
authorize itself with `requireUser()` or `requireAdmin()` from `src/lib/auth.ts`
as its first statement. If an action accepts an id, resolve it through
`resolveTargetUserId()` rather than trusting the argument. Middleware does not
help here: an action can be invoked from any route, including public ones.

Anything that should not be publicly callable belongs in `src/db/internal/` as
a plain `server-only` module.

**Environment variables.** Never give a secret a `NEXT_PUBLIC_` prefix — that
prefix inlines the value into the browser bundle the moment client code reads
it. Add new variables to `.env.example`, classify them in
`scripts/check-env-leaks.mjs`, and read server-side values through `src/env.ts`
so they are validated at startup.

**Components.** Server Components by default; add `"use client"` only when you
need state, effects or browser APIs. Push the boundary as far down the tree as
you can — a client component drags everything it imports into the bundle.

**Styling.** Tailwind utility classes, composed with the `cn()` helper. Reach
for an existing `src/components/ui/` primitive before writing a new one.

**Content.** Copy on the site describes a real business to real families. Keep
it accurate — don't ship placeholder or borrowed marketing text.

**Data.** Money is stored in whole rupees as integers. Dates crossing a
timezone boundary should be handled in UTC.

## Testing

Tests live beside the code as `*.test.ts` / `*.test.tsx`.

Cover logic where being wrong is expensive — authorization, money, dates,
availability — and the specific bug you are fixing. A regression test should
say in its name what used to go wrong:

```ts
// Regression: a room flagged available with every bed occupied used to show
// an enabled "Add Bed to Cart" button next to "Available Beds: 0".
it("refuses booking when every bed is occupied, even if flagged available", () => {
```

Prefer testing behaviour through the public interface over asserting on
internals, and query the DOM the way a user would (`getByRole`, `getByText`).

## Database changes

1. Edit `src/db/schema.ts`.
2. `pnpm db:generate --name describe_your_change`.
3. Read the generated SQL. drizzle-kit does not always get array defaults or
   enum changes right, and a migration that only works on an empty database is
   not much use against production.
4. Make it safe to re-run (`IF NOT EXISTS`, guarded `CREATE TYPE`) and safe
   against a database that already has the tables.
5. `pnpm db:migrate` locally, then run it a second time to confirm it is a
   no-op.
6. Commit the schema change and the migration together.

## Accessibility

- Every interactive element must be reachable and operable by keyboard.
- Icon-only buttons need an `aria-label`; decorative icons need `aria-hidden`.
- Don't nest an `<a>` inside a `<button>`. Use `<Button asChild><Link/></Button>`.
- Images need meaningful `alt` text — describe the content, not "image".
- Form inputs need an associated `<label>`.

## Reporting a bug

Include the route, what you expected, what happened, and anything from the
browser console or server log. If it's a data problem, the shape of the data
that triggered it is the most useful thing you can provide.

## Security

Do not open a public issue for a security problem. Email
support@aligarhhostel.com with the details and steps to reproduce.
