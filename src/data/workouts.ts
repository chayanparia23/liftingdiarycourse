import { db } from '@/db'
import { workouts } from '@/db/schema'
import { and, eq, gte, lte } from 'drizzle-orm'

export async function getWorkoutById(userId: string, workoutId: string) {
  return db.query.workouts.findFirst({
    where: and(eq(workouts.id, workoutId), eq(workouts.userId, userId)),
  })
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: { title?: string; startedAt: Date; bodyweightKg?: string }
) {
  const [workout] = await db
    .update(workouts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
  return workout
}

export async function createWorkout(
  userId: string,
  data: { title?: string; startedAt: Date; bodyweightKg?: string }
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, ...data })
    .returning()
  return workout
}

export async function getWorkoutsForDate(userId: string, date: Date) {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, start),
      lte(workouts.startedAt, end),
    ),
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
