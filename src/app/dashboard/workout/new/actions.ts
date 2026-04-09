'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createWorkout } from '@/data/workouts'

const CreateWorkoutSchema = z.object({
  title: z.string().max(120).optional(),
  startedAt: z.coerce.date(),
  bodyweightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .optional()
    .or(z.literal('')),
})

export async function createWorkoutAction(
  params: z.infer<typeof CreateWorkoutSchema>
) {
  const parsed = CreateWorkoutSchema.safeParse(params)
  if (!parsed.success) {
    throw new Error('Invalid input')
  }

  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthenticated')
  }

  const { title, startedAt, bodyweightKg } = parsed.data

  await createWorkout(userId, {
    title: title || undefined,
    startedAt,
    bodyweightKg: bodyweightKg || undefined,
  })
}
