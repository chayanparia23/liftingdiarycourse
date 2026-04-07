# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
