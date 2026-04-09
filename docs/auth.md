# Authentication

## Provider: Clerk

**This app uses [Clerk](https://clerk.com) for all authentication.**

Do NOT implement custom auth, use NextAuth, Auth.js, Lucia, or any other auth library. Clerk is the sole authentication provider.

## Rule: Get the Current User via Clerk's `auth()` Helper

**All Server Components that need the current user MUST use Clerk's `auth()` helper.**

```ts
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
```

- Never read user identity from cookies, headers, or session objects manually.
- Never pass user identity through URL params or request bodies as a trust source.
- `userId` from `auth()` is the authoritative, tamper-proof identity — use it exclusively.

## Rule: Protect Routes via Clerk Middleware

**Route protection is handled in `middleware.ts` using Clerk's `clerkMiddleware`.**

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

- Do NOT add manual auth checks in layouts or pages as a substitute for middleware — middleware is the gatekeeper.
- Do NOT rely solely on UI hiding to protect routes. Middleware must enforce access.

## Rule: Handle Unauthenticated Users Explicitly in Server Components

Even with middleware in place, Server Components that require a `userId` must handle the unauthenticated case:

```ts
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // safe to use userId here
}
```

This makes the auth dependency explicit and auditable at the call site.

## Rule: Pass `userId` Down to Data Helpers — Never Fetch It Inside Helpers

This mirrors the data-fetching rule: the Server Component is responsible for obtaining `userId` from Clerk and passing it to any `/data` helper. Data helpers must never call `auth()` themselves.

```ts
// CORRECT
const { userId } = await auth()
const workouts = await getWorkouts(userId)

// WRONG — hides the auth dependency inside the helper
export async function getWorkouts() {
  const { userId } = await auth() // don't do this
  ...
}
```

See `docs/data-fetching.md` for full details on user-scoped queries.

## Sign-In / Sign-Up Pages

Use Clerk's pre-built components for auth UI. Do not build custom sign-in or sign-up forms.

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

```tsx
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp />
}
```
