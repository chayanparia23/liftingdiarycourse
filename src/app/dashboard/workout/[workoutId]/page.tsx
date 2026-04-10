import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { getWorkoutById } from '@/data/workouts'
import { EditWorkoutForm } from './_components/EditWorkoutForm'

interface EditWorkoutPageProps {
  params: Promise<{ workoutId: string }>
}

export default async function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { workoutId } = await params
  const workout = await getWorkoutById(userId, workoutId)

  if (!workout) {
    notFound()
  }

  const defaultValues = {
    title: workout.title ?? '',
    startedAt: format(workout.startedAt, "yyyy-MM-dd'T'HH:mm"),
    bodyweightKg: workout.bodyweightKg ?? '',
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Edit Workout
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Update your training session details.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <EditWorkoutForm workoutId={workoutId} defaultValues={defaultValues} />
        </div>
      </div>
    </div>
  )
}
