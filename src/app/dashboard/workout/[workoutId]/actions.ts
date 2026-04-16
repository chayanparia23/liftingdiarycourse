'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { updateWorkout } from '@/data/workouts'
import { addExerciseToWorkout, removeExerciseFromWorkout } from '@/data/workoutExercises'
import { addSet, deleteSet } from '@/data/sets'

// ---------------------------------------------------------------------------
// Update workout metadata
// ---------------------------------------------------------------------------

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  title: z.string().max(120).optional(),
  startedAt: z.coerce.date(),
  bodyweightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .optional()
    .or(z.literal('')),
})

export async function updateWorkoutAction(
  params: z.infer<typeof UpdateWorkoutSchema>
) {
  const parsed = UpdateWorkoutSchema.safeParse(params)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthenticated')
  }

  const { workoutId, title, startedAt, bodyweightKg } = parsed.data

  await updateWorkout(userId, workoutId, {
    title: title || undefined,
    startedAt,
    bodyweightKg: bodyweightKg || undefined,
  })
}

// ---------------------------------------------------------------------------
// Add exercise to workout
// ---------------------------------------------------------------------------

const AddExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
})

export async function addExerciseToWorkoutAction(
  params: z.infer<typeof AddExerciseSchema>
) {
  const parsed = AddExerciseSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  await addExerciseToWorkout(userId, parsed.data.workoutId, parsed.data.exerciseId)
}

// ---------------------------------------------------------------------------
// Remove exercise from workout
// ---------------------------------------------------------------------------

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
})

export async function removeExerciseFromWorkoutAction(
  params: z.infer<typeof RemoveExerciseSchema>
) {
  const parsed = RemoveExerciseSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  await removeExerciseFromWorkout(userId, parsed.data.workoutExerciseId)
}

// ---------------------------------------------------------------------------
// Add set to a workout exercise
// ---------------------------------------------------------------------------

const AddSetSchema = z.object({
  workoutExerciseId: z.string().uuid(),
  weightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .optional()
    .or(z.literal('')),
  reps: z.number().int().positive().optional(),
  isWarmup: z.boolean().optional(),
})

export async function addSetAction(params: z.infer<typeof AddSetSchema>) {
  const parsed = AddSetSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const { workoutExerciseId, weightKg, reps, isWarmup } = parsed.data

  await addSet(userId, workoutExerciseId, {
    weightKg: weightKg || undefined,
    reps,
    isWarmup,
  })
}

// ---------------------------------------------------------------------------
// Delete a set
// ---------------------------------------------------------------------------

const DeleteSetSchema = z.object({
  setId: z.string().uuid(),
})

export async function deleteSetAction(params: z.infer<typeof DeleteSetSchema>) {
  const parsed = DeleteSetSchema.safeParse(params)
  if (!parsed.success) throw new Error('Invalid input')

  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  await deleteSet(userId, parsed.data.setId)
}
