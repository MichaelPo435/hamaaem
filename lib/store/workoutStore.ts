'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WorkoutSession, ActiveSet } from '@/types/workout'

interface WorkoutStore {
  activeSession: WorkoutSession | null
  history: WorkoutSession[]
  startSession: (session: WorkoutSession) => void
  updateSet: (blockId: string, exerciseSlug: string, setNumber: number, data: Partial<ActiveSet>) => void
  completeExercise: (blockId: string, exerciseSlug: string) => void
  completeSession: () => void
  skipSession: () => void
  clearActive: () => void
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      history: [],
      startSession: (session) => set({
        activeSession: { ...session, status: 'in_progress', startedAt: new Date().toISOString() }
      }),
      updateSet: (blockId, exerciseSlug, setNumber, data) => {
        set((state) => {
          if (!state.activeSession) return state
          return {
            activeSession: {
              ...state.activeSession,
              blocks: state.activeSession.blocks.map(block =>
                block.id === blockId
                  ? {
                    ...block,
                    exercises: block.exercises.map(ex =>
                      ex.exerciseSlug === exerciseSlug
                        ? {
                          ...ex,
                          sets: ex.sets.map(s =>
                            s.setNumber === setNumber ? { ...s, ...data } : s
                          )
                        }
                        : ex
                    )
                  }
                  : block
              )
            }
          }
        })
      },
      completeExercise: (blockId, exerciseSlug) => {
        set((state) => {
          if (!state.activeSession) return state
          return {
            activeSession: {
              ...state.activeSession,
              blocks: state.activeSession.blocks.map(block =>
                block.id === blockId
                  ? {
                    ...block,
                    exercises: block.exercises.map(ex =>
                      ex.exerciseSlug === exerciseSlug ? { ...ex, completed: true } : ex
                    )
                  }
                  : block
              )
            }
          }
        })
      },
      completeSession: () => {
        set((state) => {
          if (!state.activeSession) return state
          const now = new Date().toISOString()
          const startedAt = state.activeSession.startedAt || now
          const durationMs = new Date(now).getTime() - new Date(startedAt).getTime()
          const actualDurationMinutes = Math.round(durationMs / 60000)

          // Calculate total volume
          let totalVolumeKg = 0
          state.activeSession.blocks.forEach(block => {
            block.exercises.forEach(ex => {
              ex.sets.forEach(s => {
                if (s.actualReps && s.weightKg) {
                  totalVolumeKg += s.actualReps * s.weightKg
                }
              })
            })
          })

          const completed: WorkoutSession = {
            ...state.activeSession,
            status: 'completed',
            completedAt: now,
            actualDurationMinutes,
            totalVolumeKg,
          }
          return {
            activeSession: null,
            history: [completed, ...state.history],
          }
        })
      },
      skipSession: () => {
        set((state) => {
          if (!state.activeSession) return state
          const skipped: WorkoutSession = {
            ...state.activeSession,
            status: 'skipped',
            completedAt: new Date().toISOString(),
          }
          return {
            activeSession: null,
            history: [skipped, ...state.history],
          }
        })
      },
      clearActive: () => set({ activeSession: null }),
    }),
    { name: 'coach-workouts' }
  )
)
