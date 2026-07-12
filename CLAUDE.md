# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FLF GearWatch — an inventory tracker for filmmaking gear. Core model: each user tracks gear items with a status (available / checked out / missing / maintenance) and can define multiple storage locations (addresses) that gear is assigned to. Planned direction: a P2P filmmaking social network — users choose which parts of their inventory/locations are publicly visible to others, leading to friend-to-friend borrowing and eventually a rental marketplace. The visibility model is enforced by RLS (hardened 2026-07-12): all reads require a signed-in user; `location` and `equipment` rows are owner-only unless the owner sets `is_public = true`. Keep new tables/policies on this private-by-default, opt-in pattern.

## Commands

```bash
npm run dev     # dev server at http://localhost:3000
npm run build   # production build (also the de-facto type check)
npm run lint    # eslint
```

There is no test suite. Supabase credentials come from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (PostCSS plugin, no tailwind.config) · Supabase via `@supabase/ssr` · `sonner` for toasts · `@hugeicons/react` for icons.

## Architecture

### Auth & routing flow

`src/middleware.ts` is the gatekeeper for every non-static route:

1. `updateSession()` (`src/lib/supabase/middleware.ts`) refreshes the Supabase session cookie and returns the user.
2. No user → redirect to `/login`. `/login` and `/auth/*` are public.
3. Logged in but `user.user_metadata.onboarding_completed !== true` → forced to `/onboarding`; once onboarded, `/onboarding` redirects back to `/`.

The onboarding flag lives in Supabase **user_metadata**, not a table — `completeOnboarding()` in `src/app/onboarding/actions.ts` sets it via `supabase.auth.updateUser()`.

### Supabase clients — three variants, pick by context

- `src/lib/supabase/server.ts` — server components & server actions (`await createClient()`)
- `src/lib/supabase/client.ts` — client components
- `src/lib/supabase/middleware.ts` — middleware only (handles cookie write-back on the response)

### Server actions convention

All mutations go through server actions (`"use server"`), which **return** `{ success, message }` instead of throwing so client forms can render errors. Because `redirect()` throws internally, actions that redirect inside a try/catch must rethrow via `isRedirectError()` — see `src/lib/auth/actions.ts` for the pattern.

`src/app/onboarding/actions.ts` (`saveProfile`, `saveLocations`, `saveGearItems`, `completeOnboarding`) persist to the live tables (`profile`, `location`, `equipment`) and the `avatars` Storage bucket; unit tests in `actions.test.ts` mock the Supabase client.

### UI layer

- `src/components/inventory/` — the main app (`InventoryApp.tsx` holds all state; `views.tsx`, `overlays.tsx`, `Header.tsx`, `ui.tsx` render it). It currently runs entirely on **mock data** from `data.ts` — nothing is persisted to Supabase yet.
- `src/components/onboarding/OnboardingFlow.tsx` — 5-step client wizard calling the onboarding actions.
- `src/components/auth/LoginPage.tsx` — combined sign-in/sign-up form.
- `.claude/FLF-Rental-DESIGN/` holds the original HTML/JSX design prototypes the React components were ported from — reference for visual intent, not live code.

### Theming

Design tokens are CSS variables in `src/app/globals.css` (`:root` for light, `[data-theme="dark"]` for dark), exposed to Tailwind via `@theme`. `src/components/ThemeProvider.tsx` toggles the `data-theme` attribute. Use the token-based utility classes (`bg-surface`, `text-ink`, `text-muted`, `border-border`, `text-accent`, …) rather than raw Tailwind colors.

### Database

Live tables are **singular**: `profile`, `location`, `equipment` (not `profiles`/`locations`/`loans`/`inventory_items`). `supabase/schema.sql` documents this live schema as a reference snapshot — it isn't run directly. Actual schema changes go through new files in `supabase/migrations/` (applied via the Supabase MCP server or pasted into the SQL editor — the MCP `migrations` list is empty because early changes were applied by hand).

Quirks to know:
- Onboarding completion is tracked **twice**: `user_metadata.onboarding_completed` (what the middleware reads) and `profile.onboarding_complete` (DB column, set by `completeOnboarding()`). Keep them in sync.
- A signup trigger (`on_auth_user_created` → `handle_new_user()`) auto-creates the `profile` row from `first_name`/`last_name` in the signup metadata.
- `equipment.status` is text constrained by a check to: `available`, `checked-out`, `maintenance`, `missing` (matches `Status` in `src/components/inventory/types.ts`). `equipment` also has `location_id` and `assignee_id` FKs the UI doesn't use yet.
- `location` has both `is_default` and `is_primary` booleans (historical duplication; onboarding writes `is_primary`).


## Delegation (orchestrator → worker)

Session runs on Fable 5 as orchestrator: plan, scope, review. Delegate
implementation to the `builder` subagent (Sonnet 5). Use the built-in Explore
agent (read-only) for codebase research before planning. Keep plan-approval in
the main thread, and run the builder in the foreground so edit approvals surface to me.

## Testing

- **Unit/component:** Vitest + React Testing Library (happy-dom env). Server actions,
  Zod schemas, utils, sync/client components. Tests colocated as `*.test.ts(x)`.
- **E2E:** Playwright. Auth + onboarding redirect flow (middleware) and async server
  components (Vitest can't render these).

Priority targets: middleware redirects, server-action return shapes, `isRedirectError`
rethrow. Don't chase coverage on mock-data UI (`data.ts`) until persistence is wired.

