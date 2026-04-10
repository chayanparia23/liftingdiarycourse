# Routing

## Route Structure

**All application routes live under `/dashboard`.**

Do NOT create top-level routes for application features (e.g. `/workouts`, `/profile`). Every feature route must be nested under `/dashboard`:

```
/dashboard              → main dashboard
/dashboard/workout/[id] → individual workout
/dashboard/settings     → user settings
```

The only top-level routes permitted are auth pages (`/sign-in`, `/sign-up`) which are handled by Clerk.

## Rule: Protect `/dashboard` and All Sub-Routes via Middleware

**Route protection must be enforced in `middleware.ts` using Clerk's `clerkMiddleware`.**

```ts
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

- Do NOT add manual auth checks in layouts or pages as a substitute for middleware — middleware is the sole gatekeeper for route access.
- Do NOT rely on UI hiding (e.g. conditionally rendering links) to protect routes.
- All `/dashboard` routes are implicitly protected because they are not in the public route matcher.

## Rule: No Route Handlers for Feature Routes

Do not create `route.ts` files under `/dashboard` for application features. All data fetching happens in Server Components and all mutations happen via Server Actions. See `docs/data-fetching.md` and `docs/data-mutations.md`.
