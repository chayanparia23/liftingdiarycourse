export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { Dumbbell } from "lucide-react";
import { getWorkoutsForDate } from "@/data/workouts";
import { DatePicker } from "./_components/DatePicker";
import type { WorkoutSet } from "@/db/schema";

function formatSetsInfo(sets: WorkoutSet[]): string {
  const workingSets = sets.filter((s) => !s.isWarmup);
  const count = workingSets.length || sets.length;

  if (workingSets.length === 0) return `${count} sets`;

  const first = workingSets[0];
  const allSame = workingSets.every(
    (s) => s.reps === first.reps && s.weightKg === first.weightKg
  );

  if (allSame && first.reps != null && first.weightKg != null) {
    return `${count} × ${first.reps} @ ${first.weightKg} kg`;
  }

  return `${count} sets`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const date = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
  const workouts = await getWorkoutsForDate(userId!, date);

  const exercises = workouts.flatMap((w) => w.workoutExercises);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>
          <DatePicker dateStr={dateParam ?? format(new Date(), "yyyy-MM-dd")} />
        </div>

        {/* Workouts section */}
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Workouts — {format(date, "do MMM yyyy")}
          </h2>

          {exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <Dumbbell className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No workouts logged for this day.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {exercises.map((we) => (
                <li
                  key={we.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {we.exercise.name}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatSetsInfo(we.sets)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
