'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/lib/store/userStore'
import { usePlanStore } from '@/lib/store/planStore'
import type { TrainingPlan } from '@/types/plan'

const MESSAGES = [
  'מנתח את הנתונים שלך...',
  'בונה מבנה תוכנית...',
  'מתאים תרגילים לרמה שלך...',
  'מחשב עומס ונפח אימון...',
  'מסיים את התוכנית...',
]

export default function GeneratePlanPage() {
  const router = useRouter()
  const user = useUserStore(s => s.user)
  const incrementPlanGeneration = useUserStore(s => s.incrementPlanGeneration)
  const canGeneratePlan = useUserStore(s => s.canGeneratePlan)
  const addPlan = usePlanStore(s => s.addPlan)

  const [messageIdx, setMessageIdx] = useState(0)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!user) {
      router.replace('/onboarding')
      return
    }

    if (!canGeneratePlan()) {
      setError('הגעת למגבלה של 3 תוכניות ביום. נסה מחר.')
      return
    }

    const interval = setInterval(() => {
      setMessageIdx(i => (i + 1) % MESSAGES.length)
    }, 2000)

    async function generate() {
      try {
        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'שגיאה ביצירת תוכנית')
        }

        const plan: TrainingPlan = await res.json()
        addPlan(plan)
        incrementPlanGeneration()
        clearInterval(interval)
        setDone(true)

        setTimeout(() => router.replace('/plan'), 1500)
      } catch (err: unknown) {
        clearInterval(interval)
        const message = err instanceof Error ? err.message : 'שגיאה לא ידועה'
        setError(message)
      }
    }

    generate()
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-white mb-2">אופס!</h2>
        <p className="text-gray-400 mb-6 text-sm">{error}</p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => { setError(''); window.location.reload() }}
            className="w-full py-3 rounded-2xl bg-teal-500 text-white font-bold"
          >
            נסה שוב
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">התוכנית מוכנה!</h2>
        <p className="text-gray-400">מועבר לתוכנית שלך...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Animated circles */}
      <div className="relative mb-10">
        <motion.div
          className="w-32 h-32 rounded-full bg-teal-950/50"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center text-5xl"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        >
          ⚙️
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">יוצר תוכנית אישית</h2>

      <motion.p
        key={messageIdx}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-gray-400 text-base"
      >
        {MESSAGES[messageIdx]}
      </motion.p>

      <div className="mt-8 flex gap-1.5">
        {MESSAGES.map((_, i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full ${i === messageIdx ? 'bg-teal-500 w-6' : 'bg-gray-700 w-2'}`}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}
