import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { NewWorkoutForm } from './_components/NewWorkoutForm'

export default async function NewWorkoutPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            New Workout
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Log a new training session.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <NewWorkoutForm />
        </div>
      </div>
    </div>
  )
}
