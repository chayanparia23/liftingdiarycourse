# Data Fetching

## Rule: Server Components Only

**ALL data fetching MUST be done exclusively via React Server Components.**

Do NOT fetch data via:
- Route handlers (`app/api/...`)
- Client components (`'use client'`)
- `useEffect` + `fetch`
- SWR, React Query, or any client-side fetching library
- Any other mechanism

There are no exceptions to this rule. If a component needs data, it must be a Server Component (or delegate fetching to a Server Component ancestor).

## Rule: Database Access via `/data` Helpers Only

**ALL database queries MUST go through helper functions in the `/data` directory.**

- Never query the database directly from a page or component
- Never write raw SQL — use **Drizzle ORM** exclusively
- One concern per helper function; keep them focused and composable

### Example structure

```
src/
  data/
    workouts.ts      # getWorkouts(), getWorkoutById(), etc.
    exercises.ts     # getExercises(), getExerciseById(), etc.
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from '@/lib/db'
import { workouts } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
}
```

### Example Server Component consuming the helper

```tsx
// src/app/dashboard/page.tsx
import { getWorkouts } from '@/data/workouts'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()
  const workouts = await getWorkouts(session.user.id)

  return <WorkoutList workouts={workouts} />
}
```

## Rule: Users Can Only Access Their Own Data

**Every query helper MUST scope results to the authenticated user.**

- Always accept `userId` as a parameter and filter by it in the query
- Never return data without a `userId` filter
- Never derive the `userId` inside the helper — the caller (a Server Component) must obtain it from the session and pass it in explicitly. This makes the scoping visible and auditable at the call site.

### Wrong — no user scoping

```ts
// WRONG: returns all users' workouts
export async function getWorkouts() {
  return db.select().from(workouts)
}
```

### Wrong — helper fetches its own session

```ts
// WRONG: hides the auth check inside the helper, easy to forget or bypass
export async function getWorkouts() {
  const session = await auth()
  return db.select().from(workouts).where(eq(workouts.userId, session.user.id))
}
```

### Correct

```ts
// CORRECT: caller owns auth, helper owns the query
export async function getWorkouts(userId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
}
```

Failing to scope data to the authenticated user is a critical security vulnerability. Every helper must enforce this without exception.
