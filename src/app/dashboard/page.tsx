"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Dumbbell } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Placeholder workout data — replace with real data fetching later
const MOCK_WORKOUTS = [
  {
    id: "1",
    name: "Squat",
    sets: 4,
    reps: 5,
    weight: 120,
  },
  {
    id: "2",
    name: "Bench Press",
    sets: 4,
    reps: 8,
    weight: 80,
  },
  {
    id: "3",
    name: "Deadlift",
    sets: 3,
    reps: 5,
    weight: 160,
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workouts = MOCK_WORKOUTS; // will be filtered by date when data layer is added

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Dashboard
          </h1>

          {/* Date Picker */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              className={buttonVariants({ variant: "outline" }) + " gap-2"}
            >
              <CalendarIcon className="h-4 w-4 text-zinc-500" />
              {format(date, "do MMM yyyy")}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" side="bottom" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workouts section */}
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Workouts — {format(date, "do MMM yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
              <Dumbbell className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                No workouts logged for this day.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {workouts.map((workout) => (
                <li
                  key={workout.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {workout.name}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {workout.sets} × {workout.reps} @ {workout.weight} kg
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
