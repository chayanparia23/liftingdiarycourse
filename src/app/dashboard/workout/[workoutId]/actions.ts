'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { updateWorkout } from '@/data/workouts'

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
