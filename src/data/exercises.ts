import { db } from '@/db'
import { exercises } from '@/db/schema'
import type { Exercise } from '@/db/schema'
import { or, isNull, eq, asc } from 'drizzle-orm'

export async function getExercises(userId: string): Promise<Exercise[]> {
  return db
    .select()
    .from(exercises)
    .where(or(isNull(exercises.userId), eq(exercises.userId, userId)))
    .orderBy(asc(exercises.name))
}
