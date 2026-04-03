export type TrainingGoal = 'running' | 'crossfit' | 'weightlifting' | 'swimming' | 'hybrid' | 'mobility'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type EquipmentType = 'full_gym' | 'dumbbells' | 'barbell' | 'pull_up_bar' | 'resistance_bands' | 'kettlebells' | 'none'

export interface UserProfile {
  id: string
  createdAt: string
  name?: string

  goals: TrainingGoal[]
  experienceLevel: ExperienceLevel
  weeklyAvailability: number
  sessionDuration: 30 | 45 | 60 | 90
  equipment: EquipmentType[]
  injuries: string[]
  age?: number
  weightKg?: number
  heightCm?: number

  activePlanId?: string
  onboardingCompleted: boolean
  planGenerationsToday: number
  lastGenerationDate?: string
}
