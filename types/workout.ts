import type { TrainingGoal } from './user'

export interface WorkoutSession {
  id: string
  planId?: string
  planWeek?: number
  planDay?: number
  userId: string
  scheduledDate?: string
  startedAt?: string
  completedAt?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped'
  title: string
  type: TrainingGoal
  estimatedDurationMinutes: number
  actualDurationMinutes?: number
  notes?: string
  blocks: ActiveWorkoutBlock[]
  totalVolumeKg?: number
}

export interface ActiveWorkoutBlock {
  id: string
  title: string
  type: string
  exercises: ActiveExercise[]
  rounds?: number
  currentRound?: number
}

export interface ActiveExercise {
  exerciseSlug: string
  nameHe: string
  sets: ActiveSet[]
  durationSeconds?: number
  distanceMeters?: number
  notes?: string
  completed: boolean
}

export interface ActiveSet {
  setNumber: number
  targetReps?: string
  actualReps?: number
  weightKg?: number
  rpe?: number
  durationSeconds?: number
  completed: boolean
}
