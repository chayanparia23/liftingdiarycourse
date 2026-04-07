import {
  pgTable,
  pgEnum,
  uuid,
  text,
  varchar,
  smallint,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const setTypeEnum = pgEnum('set_type', [
  'weight_reps',
  'bodyweight_reps',
]);

// ---------------------------------------------------------------------------
// exercises — shared catalog + user-created exercises
// ---------------------------------------------------------------------------

export const exercises = pgTable(
  'exercises',
  {
    id:              uuid('id').defaultRandom().primaryKey(),
    // NULL = system/global; set = user-owned private exercise
    userId:          text('user_id'),
    name:            varchar('name', { length: 120 }).notNull(),
    isSystemDefault: boolean('is_system_default').notNull().default(false),
    createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('exercises_user_id_idx').on(t.userId),
    uniqueIndex('exercises_global_name_unique_idx').on(t.name).where(sql`user_id IS NULL`),
    uniqueIndex('exercises_user_name_unique_idx').on(t.userId, t.name).where(sql`user_id IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// workouts — one row per training session
// ---------------------------------------------------------------------------

export const workouts = pgTable(
  'workouts',
  {
    id:           uuid('id').defaultRandom().primaryKey(),
    userId:       text('user_id').notNull(),
    title:        varchar('title', { length: 120 }),
    startedAt:    timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt:  timestamp('completed_at', { withTimezone: true }),
    bodyweightKg: numeric('bodyweight_kg', { precision: 5, scale: 2 }),
    createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('workouts_user_id_started_at_idx').on(t.userId, t.startedAt),
  ],
);

// ---------------------------------------------------------------------------
// workout_exercises — ordered exercises within a workout session
// ---------------------------------------------------------------------------

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id:         uuid('id').defaultRandom().primaryKey(),
    workoutId:  uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'restrict' }),
    order:      smallint('order').notNull(),
    createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('workout_exercises_workout_id_idx').on(t.workoutId),
    uniqueIndex('workout_exercises_workout_order_unique_idx').on(t.workoutId, t.order),
  ],
);

// ---------------------------------------------------------------------------
// sets — individual sets within a workout_exercise entry
// ---------------------------------------------------------------------------

export const sets = pgTable(
  'sets',
  {
    id:                 uuid('id').defaultRandom().primaryKey(),
    workoutExerciseId:  uuid('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
    position:           smallint('position').notNull(),
    type:               setTypeEnum('type').notNull(),
    // weight_reps
    weightKg:           numeric('weight_kg', { precision: 6, scale: 2 }),
    reps:               integer('reps'),
    // bodyweight_reps (positive = added weight, negative = assistance, null = pure bodyweight)
    assistanceWeightKg: numeric('assistance_weight_kg', { precision: 6, scale: 2 }),
    isWarmup:           boolean('is_warmup').notNull().default(false),
    createdAt:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('sets_workout_exercise_id_idx').on(t.workoutExerciseId),
    uniqueIndex('sets_workout_exercise_position_unique_idx').on(t.workoutExerciseId, t.position),
  ],
);

// ---------------------------------------------------------------------------
// Relations — for Drizzle relational query API (db.query.*)
// ---------------------------------------------------------------------------

export const exercisesRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout:  one(workouts,  { fields: [workoutExercises.workoutId],  references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets:     many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ---------------------------------------------------------------------------
// TypeScript types
// ---------------------------------------------------------------------------

export type Exercise           = InferSelectModel<typeof exercises>;
export type NewExercise        = InferInsertModel<typeof exercises>;
export type Workout            = InferSelectModel<typeof workouts>;
export type NewWorkout         = InferInsertModel<typeof workouts>;
export type WorkoutExercise    = InferSelectModel<typeof workoutExercises>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercises>;
export type WorkoutSet         = InferSelectModel<typeof sets>;
export type NewWorkoutSet      = InferInsertModel<typeof sets>;
