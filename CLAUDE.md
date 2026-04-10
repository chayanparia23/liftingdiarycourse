# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Rule

**Before writing any code, always read the relevant documentation files in the `/docs` directory first.** Check `/docs` for any spec, standard, or guide that applies to the area being worked on, and adhere to it strictly. Do not make assumptions about conventions — consult the docs.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

No test runner is configured.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4

**Source layout:** All application code lives under `src/app/` using the Next.js App Router convention — `layout.tsx` for the root layout, `page.tsx` files for routes.

**Path alias:** `@/*` maps to `./src/*`.

**Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`. Global styles and CSS custom properties (theming tokens) are in `src/app/globals.css`. Dark mode is supported via CSS variables.

**Current state:** Fresh `create-next-app` scaffold — no domain logic yet. The project is intended to become a lifting/workout diary application.

## Data Fetching

See `docs/data-fetching.md` for the full spec. Key rules:

- **Server Components only** — never fetch data in client components, route handlers, or via any client-side library.
- **`/data` helpers only** — all DB queries go through helper functions in `src/data/`, using Drizzle ORM. No raw SQL.
- **User scoping is mandatory** — every query helper must filter by `userId`. A user must never be able to access another user's data.

## Data Mutations

See `docs/data-mutations.md` for the full spec. Key rules:

- **`/data` helpers only** — all DB writes go through helper functions in `src/data/`, using Drizzle ORM. No raw SQL.
- **Server Actions only** — all mutations must be triggered via Server Actions. No route handlers or client-side fetches.
- **Colocated `actions.ts`** — Server Actions live in an `actions.ts` file next to the `page.tsx` that uses them.
- **No `FormData` params** — action parameters must be explicitly typed; derive types from Zod schemas with `z.infer<>`.
- **Zod validation is mandatory** — every Server Action must validate its arguments with Zod before doing any work.
- **User scoping is mandatory** — every mutation helper must filter by `userId`. A user must never be able to mutate another user's data.
- **No `redirect()` in actions** — never call `redirect()` inside a Server Action; handle navigation client-side with `router.push()` after the action resolves.

## Authentication

See `docs/auth.md` for the full spec. Key rules:

- **Clerk only** — no custom auth, NextAuth, or any other auth library.
- **`auth()` from `@clerk/nextjs/server`** — the sole way to get the current user in Server Components.
- **Middleware protects routes** — use `clerkMiddleware` in `middleware.ts`; do not rely on UI hiding.
- **Pass `userId` to helpers** — Server Components obtain `userId` from `auth()` and pass it down; helpers never call `auth()` themselves.

## Server Components

See `docs/server-components.md` for the full spec. Key rules:

- **`params` and `searchParams` must be awaited** — in Next.js 15 they are Promises; always `await` before accessing properties.
- **Type them as `Promise<{ ... }>`** — declare the correct type so TypeScript enforces the await.
- **Pages must be `async`** — any page or layout that reads `params`, `searchParams`, or fetches data must be an `async` function.

## Routing

See `docs/routing.md` for the full spec. Key rules:

- **All routes under `/dashboard`** — every feature route must be nested under `/dashboard`; no top-level feature routes.
- **Middleware protects `/dashboard`** — use `clerkMiddleware` in `middleware.ts`; only `/sign-in` and `/sign-up` are public.
- **No route handlers for features** — use Server Components for fetching and Server Actions for mutations instead.

## UI Standards

See `docs/ui.md` for the full spec. Key rules:

- **Only shadcn/ui components** — no custom UI components. Add missing ones with `npx shadcn@latest add <name>`.
- **Date formatting** — use `date-fns` exclusively. User-facing dates must use `format(date, 'do MMM yyyy')` → `"1st Sep 2025"`.
