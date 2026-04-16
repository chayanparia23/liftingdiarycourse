import { db } from '@/db'
import { workoutExercises, workouts } from '@/db/schema'
import type { Exercise, WorkoutExercise, WorkoutSet } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'

export type WorkoutExerciseWithRelations = WorkoutExercise & {
  exercise: Exercise
  sets: WorkoutSet[]
}

export async function getWorkoutWithExercises(userId: string, workoutId: string) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
    with: {
      workoutExercises: {
        orderBy: (we, { asc }) => [asc(we.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (s, { asc }) => [asc(s.position)],
          },
        },
      },
    },
  })
}

export async function addExerciseToWorkout(
  userId: string,
  workoutId: string,
  exerciseId: string
) {
  const workout = await db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  })
  if (!workout) throw new Error('Workout not found')

  const existing = await db
    .select({ order: workoutExercises.order })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(desc(workoutExercises.order))
    .limit(1)

  const nextOrder = existing.length > 0 ? existing[0].order + 1 : 0

  const [row] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: nextOrder })
    .returning()
  return row
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: string
) {
  const rows = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )

  if (!rows.length) throw new Error('Not found')

  await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
}
