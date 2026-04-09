# Data Mutations

## Rule: Database Writes via `/data` Helpers Only

**ALL database mutations MUST go through helper functions in the `src/data/` directory.**

- Never write to the database directly from a Server Action, page, or component
- Never write raw SQL — use **Drizzle ORM** exclusively
- One concern per helper function; keep them focused and composable

### Example structure

```
src/
  data/
    workouts.ts      # createWorkout(), updateWorkout(), deleteWorkout(), etc.
    exercises.ts     # createExercise(), updateExercise(), deleteExercise(), etc.
```

### Example helper

```ts
// src/data/workouts.ts
import { db } from '@/lib/db'
import { workouts } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning()
}

export async function deleteWorkout(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId) && eq(workouts.userId, userId))
}
```

## Rule: Mutations MUST Be Performed via Server Actions

**ALL data mutations MUST be triggered via Next.js Server Actions.**

Do NOT mutate data via:
- Route handlers (`app/api/...`)
- Client components calling `fetch` directly
- Any other mechanism

Server Actions are the only permitted mutation path. There are no exceptions.

## Rule: Server Actions MUST Live in Colocated `actions.ts` Files

**Each Server Action MUST be defined in an `actions.ts` file colocated with the route that uses it.**

- Place `actions.ts` alongside the `page.tsx` for the feature it serves
- Do not centralise all actions into a single global file
- Do not define Server Actions inline inside components

### Example structure

```
src/
  app/
    workouts/
      page.tsx
      actions.ts    # Server Actions for the workouts route
    workouts/[id]/
      page.tsx
      actions.ts    # Server Actions for the workout detail route
```

### Example actions.ts

```ts
// src/app/workouts/actions.ts
'use server'

import { createWorkout } from '@/data/workouts'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
})

export async function createWorkoutAction(params: z.infer<typeof CreateWorkoutSchema>) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const session = await auth()
  return createWorkout(session.user.id, parsed.data.name, parsed.data.date)
}
```

## Rule: Server Action Parameters Must Be Typed — No `FormData`

**ALL Server Action parameters MUST use explicit TypeScript types.**

- Do NOT accept `FormData` as a parameter type
- Define a typed params object for every action
- The Zod schema is the source of truth for the shape; derive the TypeScript type from it with `z.infer<typeof Schema>`

### Wrong — FormData parameter

```ts
// WRONG: untyped, requires manual field extraction
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get('name') as string
  // ...
}
```

### Correct — typed params object

```ts
// CORRECT: explicit shape, validated by Zod
const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
})

export async function createWorkoutAction(params: z.infer<typeof CreateWorkoutSchema>) {
  // ...
}
```

## Rule: ALL Server Actions MUST Validate Arguments via Zod

**Every Server Action MUST validate its arguments with a Zod schema before doing any work.**

- Define a Zod schema for every action's parameter shape
- Call `safeParse` (preferred) or `parse` at the very top of the action body, before any auth check or DB call
- Throw or return an error immediately if validation fails — never proceed with invalid input

### Example

```ts
// src/app/workouts/actions.ts
'use server'

import { z } from 'zod'
import { updateWorkout } from '@/data/workouts'
import { auth } from '@/lib/auth'

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100),
  date: z.coerce.date(),
})

export async function updateWorkoutAction(params: z.infer<typeof UpdateWorkoutSchema>) {
  const parsed = UpdateWorkoutSchema.safeParse(params)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const session = await auth()
  return updateWorkout(session.user.id, parsed.data.workoutId, parsed.data.name, parsed.data.date)
}
```

Skipping Zod validation is a security vulnerability — never assume the caller has passed safe or correctly-shaped data.

## Rule: User Scoping is Mandatory

**Every mutation helper MUST scope the operation to the authenticated user.**

- The Server Action is responsible for obtaining `userId` from the session and passing it to the helper
- The helper must include `userId` in the `WHERE` clause of every `UPDATE` and `DELETE` to prevent one user from mutating another user's data
- Never derive `userId` inside the helper

### Wrong — no user scoping on update

```ts
// WRONG: any authenticated user can update any workout
export async function updateWorkout(workoutId: string, name: string) {
  return db.update(workouts).set({ name }).where(eq(workouts.id, workoutId))
}
```

### Correct

```ts
// CORRECT: update is scoped to the owning user
export async function updateWorkout(userId: string, workoutId: string, name: string) {
  return db
    .update(workouts)
    .set({ name })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
}
```

Failing to scope mutations to the authenticated user is a critical security vulnerability. Every helper must enforce this without exception.

## Rule: No `redirect()` Inside Server Actions — Redirect Client-Side

**Never call `redirect()` from `next/navigation` inside a Server Action.**

- Server Actions must return a value (or void) — they must not trigger a redirect internally
- After a Server Action resolves on the client, perform any navigation using the Next.js router (e.g. `router.push()` from `useRouter()`)

### Wrong — redirect inside the action

```ts
// WRONG: redirect() inside a Server Action breaks error handling and is not permitted
import { redirect } from 'next/navigation'

export async function createWorkoutAction(params: z.infer<typeof CreateWorkoutSchema>) {
  // ... create workout ...
  redirect('/dashboard')  // ← never do this
}
```

### Correct — redirect on the client after the action resolves

```ts
// actions.ts — returns normally, no redirect
export async function createWorkoutAction(params: z.infer<typeof CreateWorkoutSchema>) {
  // ... create workout ...
}
```

```tsx
// component — handles navigation after the action settles
'use client'
import { useRouter } from 'next/navigation'
import { createWorkoutAction } from './actions'

export function CreateWorkoutForm() {
  const router = useRouter()

  async function handleSubmit(params) {
    await createWorkoutAction(params)
    router.push('/dashboard')
  }
  // ...
}
```
