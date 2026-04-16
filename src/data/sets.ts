import { db } from '@/db'
import { sets, workoutExercises, workouts } from '@/db/schema'
import type { WorkoutSet } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'

export async function addSet(
  userId: string,
  workoutExerciseId: string,
  data: { weightKg?: string; reps?: number; isWarmup?: boolean }
): Promise<WorkoutSet> {
  const ownership = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    )

  if (!ownership.length) throw new Error('Not found')

  const existing = await db
    .select({ position: sets.position })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))
    .orderBy(desc(sets.position))
    .limit(1)

  const nextPosition = existing.length > 0 ? existing[0].position + 1 : 0

  const [set] = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      position: nextPosition,
      type: 'weight_reps',
      weightKg: data.weightKg || null,
      reps: data.reps ?? null,
      isWarmup: data.isWarmup ?? false,
    })
    .returning()
  return set
}

export async function deleteSet(userId: string, setId: string): Promise<void> {
  const ownership = await db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(sets.id, setId), eq(workouts.userId, userId)))

  if (!ownership.length) throw new Error('Not found')

  await db.delete(sets).where(eq(sets.id, setId))
}
