'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Exercise } from '@/db/schema'
import type { WorkoutExerciseWithRelations } from '@/data/workoutExercises'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExerciseCard } from './ExerciseCard'
import { addExerciseToWorkoutAction } from '../actions'

interface ExerciseLoggerProps {
  workoutId: string
  workoutExercises: WorkoutExerciseWithRelations[]
  availableExercises: Exercise[]
}

export function ExerciseLogger({
  workoutId,
  workoutExercises,
  availableExercises,
}: ExerciseLoggerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('')

  function handleAddExercise() {
    if (!selectedExerciseId) return
    startTransition(async () => {
      await addExerciseToWorkoutAction({ workoutId, exerciseId: selectedExerciseId })
      setSelectedExerciseId('')
      router.refresh()
    })
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Exercises
      </h2>

      <div className="space-y-4">
        {workoutExercises.map((we) => (
          <ExerciseCard key={we.id} workoutExercise={we} />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <Select value={selectedExerciseId} onValueChange={(v) => setSelectedExerciseId(v ?? '')}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select an exercise…" />
          </SelectTrigger>
          <SelectContent>
            {availableExercises.map((ex) => (
              <SelectItem key={ex.id} value={ex.id}>
                {ex.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddExercise}
          disabled={!selectedExerciseId || isPending}
        >
          Add Exercise
        </Button>
      </div>
    </div>
  )
}
