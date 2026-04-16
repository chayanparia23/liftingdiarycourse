'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkoutExerciseWithRelations } from '@/data/workoutExercises'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { removeExerciseFromWorkoutAction, addSetAction, deleteSetAction } from '../actions'

interface ExerciseCardProps {
  workoutExercise: WorkoutExerciseWithRelations
}

export function ExerciseCard({ workoutExercise }: ExerciseCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [weightKg, setWeightKg] = useState('')
  const [reps, setReps] = useState('')
  const [isWarmup, setIsWarmup] = useState(false)

  function handleRemoveExercise() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction({ workoutExerciseId: workoutExercise.id })
      router.refresh()
    })
  }

  function handleDeleteSet(setId: string) {
    startTransition(async () => {
      await deleteSetAction({ setId })
      router.refresh()
    })
  }

  function handleAddSet() {
    if (!weightKg && !reps) return
    startTransition(async () => {
      await addSetAction({
        workoutExerciseId: workoutExercise.id,
        weightKg: weightKg || undefined,
        reps: reps ? parseInt(reps, 10) : undefined,
        isWarmup,
      })
      setWeightKg('')
      setReps('')
      setIsWarmup(false)
      router.refresh()
    })
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
          {workoutExercise.exercise.name}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={handleRemoveExercise}
          className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
        >
          Remove
        </Button>
      </div>

      {workoutExercise.sets.length > 0 && (
        <table className="mb-4 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="pb-2 pr-4">#</th>
              <th className="pb-2 pr-4">Weight (kg)</th>
              <th className="pb-2 pr-4">Reps</th>
              <th className="pb-2 pr-4">Warmup</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {workoutExercise.sets.map((set, i) => (
              <tr
                key={set.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
              >
                <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">{i + 1}</td>
                <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                  {set.weightKg ?? '—'}
                </td>
                <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">
                  {set.reps ?? '—'}
                </td>
                <td className="py-2 pr-4 text-zinc-500 dark:text-zinc-400">
                  {set.isWarmup ? 'Yes' : 'No'}
                </td>
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={isPending}
                    onClick={() => handleDeleteSet(set.id)}
                    className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                    aria-label="Delete set"
                  >
                    ✕
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Weight (kg)
          </label>
          <Input
            type="number"
            min="0"
            step="0.5"
            placeholder="e.g. 80"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-28"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Reps
          </label>
          <Input
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 8"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-20"
          />
        </div>
        <div className="flex flex-col items-center gap-1 pb-1">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Warmup
          </label>
          <input
            type="checkbox"
            checked={isWarmup}
            onChange={(e) => setIsWarmup(e.target.checked)}
            className="h-4 w-4"
          />
        </div>
        <Button
          onClick={handleAddSet}
          disabled={(!weightKg && !reps) || isPending}
          size="sm"
        >
          Log Set
        </Button>
      </div>
    </div>
  )
}
