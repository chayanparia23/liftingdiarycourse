# Server Components

## Rule: `params` and `searchParams` MUST Be Awaited

**This project runs Next.js 15, where `params` and `searchParams` are Promises. They MUST be awaited before accessing any property.**

Do NOT destructure or read properties from `params` or `searchParams` synchronously — they are not plain objects.

### Wrong — synchronous access

```tsx
// WRONG: params is a Promise in Next.js 15, this will not work
export default async function WorkoutPage({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params  // ← runtime error
}
```

### Correct — awaited before use

```tsx
// CORRECT: await params before destructuring
export default async function WorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params
}
```

### Correct — `searchParams` follows the same rule

```tsx
// CORRECT
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
}
```

This applies to every dynamic route segment and every page that reads query string values. There are no exceptions.

## Rule: Type `params` and `searchParams` as Promises

**Always declare the prop type as `Promise<{ ... }>`, not as a plain object.**

TypeScript will catch incorrect access patterns when the type is declared correctly. If you type `params` as a plain object, you lose the type-safety that enforces the await.

```tsx
// WRONG type — hides the async requirement
interface Props {
  params: { workoutId: string }
}

// CORRECT type — makes the await requirement visible
interface Props {
  params: Promise<{ workoutId: string }>
}
```

## Rule: Page Components Must Be `async`

**All page and layout Server Components that access `params`, `searchParams`, or fetch data MUST be declared as `async` functions.**

```tsx
// CORRECT
export default async function WorkoutPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params
  // ...
}
```
