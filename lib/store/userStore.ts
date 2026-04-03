'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, TrainingGoal, ExperienceLevel, EquipmentType } from '@/types/user'

interface UserStore {
  user: UserProfile | null
  setUser: (user: UserProfile) => void
  updateUser: (updates: Partial<UserProfile>) => void
  resetUser: () => void
  canGeneratePlan: () => boolean
  incrementPlanGeneration: () => void
}

const defaultUser: UserProfile = {
  id: '',
  createdAt: '',
  goals: [],
  experienceLevel: 'beginner',
  weeklyAvailability: 3,
  sessionDuration: 60,
  equipment: [],
  injuries: [],
  onboardingCompleted: false,
  planGenerationsToday: 0,
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      resetUser: () => set({ user: null }),
      canGeneratePlan: () => {
        const { user } = get()
        if (!user) return true
        const today = new Date().toISOString().split('T')[0]
        if (user.lastGenerationDate !== today) return true
        return user.planGenerationsToday < 3
      },
      incrementPlanGeneration: () => {
        const today = new Date().toISOString().split('T')[0]
        set((state) => {
          if (!state.user) return state
          const sameDay = state.user.lastGenerationDate === today
          return {
            user: {
              ...state.user,
              planGenerationsToday: sameDay ? state.user.planGenerationsToday + 1 : 1,
              lastGenerationDate: today,
            }
          }
        })
      },
    }),
    { name: 'coach-user' }
  )
)
