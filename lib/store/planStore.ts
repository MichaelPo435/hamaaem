'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrainingPlan } from '@/types/plan'

interface PlanStore {
  plans: TrainingPlan[]
  activePlan: TrainingPlan | null
  setActivePlan: (plan: TrainingPlan) => void
  addPlan: (plan: TrainingPlan) => void
  archivePlan: (id: string) => void
  deletePlan: (id: string) => void
  getActivePlan: () => TrainingPlan | null
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plans: [],
      activePlan: null,
      setActivePlan: (plan) => {
        set((state) => ({
          activePlan: plan,
          plans: state.plans.map(p =>
            p.id === plan.id ? plan : { ...p, status: p.status === 'active' ? 'archived' : p.status }
          )
        }))
      },
      addPlan: (plan) => {
        set((state) => ({
          plans: [plan, ...state.plans.map(p => ({ ...p, status: p.status === 'active' ? 'archived' as const : p.status }))],
          activePlan: plan,
        }))
      },
      archivePlan: (id) => {
        set((state) => ({
          plans: state.plans.map(p => p.id === id ? { ...p, status: 'archived' as const } : p),
          activePlan: state.activePlan?.id === id ? null : state.activePlan,
        }))
      },
      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter(p => p.id !== id),
          activePlan: state.activePlan?.id === id ? null : state.activePlan,
        }))
      },
      getActivePlan: () => get().activePlan,
    }),
    { name: 'coach-plans' }
  )
)
