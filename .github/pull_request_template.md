## What changed

<!-- What does this do, and why is it needed? If it fixes a bug, describe the
     symptom a user would have seen. -->

## How to verify

<!-- Routes to visit, steps to reproduce, or the test that now passes. -->

## Checklist

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm check:env`
- [ ] `pnpm test`
- [ ] `pnpm build`

If the change touches any of these, confirm it:

- [ ] **Server actions** — every new export in `src/db/queries/` calls
      `requireUser()` or `requireAdmin()`, and any id argument goes through
      `resolveTargetUserId()`
- [ ] **Env vars** — added to `.env.example` and classified in
      `scripts/check-env-leaks.mjs`; no secret carries a `NEXT_PUBLIC_` prefix
- [ ] **Database** — migration committed alongside the schema change, and
      re-running it is a no-op
- [ ] **UI** — keyboard reachable, icon-only buttons labelled, images have
      meaningful `alt` text
- [ ] **Copy** — describes the business accurately; no placeholder text
