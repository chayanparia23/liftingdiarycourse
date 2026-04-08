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

## UI Standards

See `docs/ui.md` for the full spec. Key rules:

- **Only shadcn/ui components** — no custom UI components. Add missing ones with `npx shadcn@latest add <name>`.
- **Date formatting** — use `date-fns` exclusively. User-facing dates must use `format(date, 'do MMM yyyy')` → `"1st Sep 2025"`.
