export type ExerciseCategory = 'strength' | 'cardio' | 'mobility' | 'yoga' | 'stretching' | 'crossfit' | 'swimming' | 'plyometric'
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'core' | 'glutes' | 'quads' | 'hamstrings' | 'calves' | 'full_body' | 'hip_flexors' | 'neck' | 'forearms'

export interface Exercise {
  id: string
  slug: string
  nameHe: string
  nameEn: string
  category: ExerciseCategory
  equipment: string[]
  muscleGroups: {
    primary: MuscleGroup[]
    secondary: MuscleGroup[]
  }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string[]
  tips?: string[]
  videoYouTubeId?: string
  tags: string[]
}

export interface MobilityRoutine {
  id: string
  slug: string
  titleHe: string
  descriptionHe: string
  category: 'yoga' | 'stretching' | 'mobility' | 'foam_rolling'
  durationMinutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  targetAreas: MuscleGroup[]
  exercises: MobilityExercise[]
  videoYouTubeId?: string
}

export interface MobilityExercise {
  exerciseId: string
  nameHe: string
  holdSeconds: number
  sides?: 'both' | 'single'
  instruction: string
  videoYouTubeId?: string
}
