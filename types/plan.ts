import type { TrainingGoal, ExperienceLevel } from './user'

export interface TrainingPlan {
  id: string
  userId: string
  createdAt: string
  generatedBy: 'claude' | 'manual'
  title: string
  description: string
  type: TrainingGoal
  durationWeeks: number
  level: ExperienceLevel
  status: 'active' | 'completed' | 'archived'
  weeks: TrainingWeek[]
}

export interface TrainingWeek {
  weekNumber: number
  theme?: string
  days: TrainingDay[]
}

export interface TrainingDay {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  isRestDay: boolean
  session?: WorkoutSessionTemplate
}

export interface WorkoutSessionTemplate {
  id: string
  title: string
  type: TrainingGoal
  estimatedDurationMinutes: number
  blocks: WorkoutBlock[]
}

export interface WorkoutBlock {
  id: string
  title: string
  type: 'warmup' | 'main' | 'cooldown' | 'circuit' | 'amrap' | 'emom' | 'run'
  exercises: TemplateExercise[]
  rounds?: number
  timeCapMinutes?: number
  notes?: string
}

export interface TemplateExercise {
  exerciseSlug: string
  nameHe: string
  sets?: number
  reps?: string
  weightNote?: string
  durationSeconds?: number
  distanceMeters?: number
  restSeconds?: number
  notes?: string
}
