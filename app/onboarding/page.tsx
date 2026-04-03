'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/lib/store/userStore'
import type { UserProfile, TrainingGoal, ExperienceLevel, EquipmentType } from '@/types/user'

const GOALS: { id: TrainingGoal; label: string; emoji: string; desc: string }[] = [
  { id: 'running', label: 'ריצה', emoji: '🏃', desc: 'ספרינטים, 5K, מרתון' },
  { id: 'weightlifting', label: 'הרמת משקולות', emoji: '🏋️', desc: 'כוח, מסה, פאוורליפטינג' },
  { id: 'crossfit', label: 'קרוספיט', emoji: '💪', desc: 'WOD, אימונים מגוונים' },
  { id: 'swimming', label: 'שחייה', emoji: '🏊', desc: 'קולות, כרישים, טריאתלון' },
  { id: 'hybrid', label: 'הייבריד', emoji: '⚡', desc: 'כוח + קרדיו + ספורט' },
  { id: 'mobility', label: 'מוביליטי', emoji: '🧘', desc: 'יוגה, גמישות, בריאות' },
]

const LEVELS: { id: ExperienceLevel; label: string; desc: string; emoji: string }[] = [
  { id: 'beginner', label: 'מתחיל', desc: 'פחות משנה ניסיון', emoji: '🌱' },
  { id: 'intermediate', label: 'בינוני', desc: '1-3 שנות ניסיון', emoji: '🔥' },
  { id: 'advanced', label: 'מתקדם', desc: '3+ שנות ניסיון', emoji: '⚡' },
]

const EQUIPMENT: { id: EquipmentType; label: string; emoji: string }[] = [
  { id: 'full_gym', label: 'חדר כושר מלא', emoji: '🏟️' },
  { id: 'barbell', label: 'מוט + משקולות', emoji: '🏋️' },
  { id: 'dumbbells', label: 'משקולות יד', emoji: '🦾' },
  { id: 'pull_up_bar', label: 'מתח', emoji: '🎯' },
  { id: 'kettlebells', label: 'קטלבלים', emoji: '⚙️' },
  { id: 'resistance_bands', label: 'גומיות', emoji: '🌀' },
  { id: 'none', label: 'ללא ציוד', emoji: '🧘' },
]

const DAYS = [2, 3, 4, 5, 6, 7]
const DURATIONS = [30, 45, 60, 90]

const INJURIES = [
  'כתף', 'גב תחתון', 'ברך', 'קרסול', 'מפרק ירך', 'מרפק', 'צוואר', 'קרע בשריר', 'פציעת גיד'
]

interface OnboardingData {
  goals: TrainingGoal[]
  experienceLevel: ExperienceLevel | ''
  weeklyAvailability: number
  sessionDuration: 30 | 45 | 60 | 90
  equipment: EquipmentType[]
  injuries: string[]
  age: string
  weightKg: string
  name: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const setUser = useUserStore(s => s.setUser)
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    goals: [],
    experienceLevel: '',
    weeklyAvailability: 3,
    sessionDuration: 60,
    equipment: [],
    injuries: [],
    age: '',
    weightKg: '',
    name: '',
  })

  const totalSteps = 6
  const progress = ((step + 1) / totalSteps) * 100

  function toggleGoal(id: TrainingGoal) {
    setData(d => ({
      ...d,
      goals: d.goals.includes(id) ? d.goals.filter(g => g !== id) : [...d.goals, id]
    }))
  }

  function toggleEquipment(id: EquipmentType) {
    setData(d => ({
      ...d,
      equipment: d.equipment.includes(id) ? d.equipment.filter(e => e !== id) : [...d.equipment, id]
    }))
  }

  function toggleInjury(injury: string) {
    setData(d => ({
      ...d,
      injuries: d.injuries.includes(injury) ? d.injuries.filter(i => i !== injury) : [...d.injuries, injury]
    }))
  }

  function canProceed() {
    if (step === 0) return data.goals.length > 0
    if (step === 1) return data.experienceLevel !== ''
    if (step === 2) return true
    if (step === 3) return data.equipment.length > 0
    return true
  }

  function handleComplete() {
    const user: UserProfile = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: data.name || undefined,
      goals: data.goals,
      experienceLevel: data.experienceLevel as ExperienceLevel,
      weeklyAvailability: data.weeklyAvailability,
      sessionDuration: data.sessionDuration,
      equipment: data.equipment,
      injuries: data.injuries,
      age: data.age ? parseInt(data.age) : undefined,
      weightKg: data.weightKg ? parseFloat(data.weightKg) : undefined,
      onboardingCompleted: true,
      planGenerationsToday: 0,
    }
    setUser(user)
    router.push('/plan/generate')
  }

  const steps = [
    // Step 0: Goals
    <div key="goals">
      <h2 className="text-xl font-bold text-white mb-2">מה המטרות שלך? 🎯</h2>
      <p className="text-gray-400 text-sm mb-6">בחר אחת או יותר</p>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={`p-4 rounded-2xl border-2 text-right transition-all ${
              data.goals.includes(g.id)
                ? 'border-orange-500 bg-orange-950/30'
                : 'border-gray-700 bg-gray-800'
            }`}
          >
            <div className="text-2xl mb-1">{g.emoji}</div>
            <div className="font-semibold text-sm text-white">{g.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{g.desc}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Level
    <div key="level">
      <h2 className="text-xl font-bold text-white mb-2">מה הרמה שלך? 📊</h2>
      <p className="text-gray-400 text-sm mb-6">זה עוזר לנו לכייל את הקושי</p>
      <div className="space-y-3">
        {LEVELS.map(l => (
          <button
            key={l.id}
            onClick={() => setData(d => ({ ...d, experienceLevel: l.id }))}
            className={`w-full p-4 rounded-2xl border-2 text-right flex items-center gap-4 transition-all ${
              data.experienceLevel === l.id
                ? 'border-orange-500 bg-orange-950/30'
                : 'border-gray-700 bg-gray-800'
            }`}
          >
            <span className="text-3xl">{l.emoji}</span>
            <div>
              <div className="font-semibold text-white">{l.label}</div>
              <div className="text-sm text-gray-400">{l.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Availability
    <div key="availability">
      <h2 className="text-xl font-bold text-white mb-2">כמה אתה מתאמן? ⏰</h2>
      <p className="text-gray-400 text-sm mb-6">ימים ומשך כל אימון</p>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          ימי אימון בשבוע: <span className="text-orange-500 font-bold">{data.weeklyAvailability}</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => setData(prev => ({ ...prev, weeklyAvailability: d }))}
              className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${
                data.weeklyAvailability === d
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          משך אימון: <span className="text-orange-500 font-bold">{data.sessionDuration} דקות</span>
        </label>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => setData(prev => ({ ...prev, sessionDuration: d as 30 | 45 | 60 | 90 }))}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                data.sessionDuration === d
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {d}′
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 3: Equipment
    <div key="equipment">
      <h2 className="text-xl font-bold text-white mb-2">איזה ציוד יש לך? 🏋️</h2>
      <p className="text-gray-400 text-sm mb-6">בחר את כל מה שרלוונטי</p>
      <div className="grid grid-cols-2 gap-3">
        {EQUIPMENT.map(e => (
          <button
            key={e.id}
            onClick={() => toggleEquipment(e.id)}
            className={`p-3 rounded-2xl border-2 text-right flex items-center gap-2 transition-all ${
              data.equipment.includes(e.id)
                ? 'border-orange-500 bg-orange-950/30'
                : 'border-gray-700 bg-gray-800'
            }`}
          >
            <span className="text-xl">{e.emoji}</span>
            <span className="text-sm font-medium text-gray-200">{e.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 4: Injuries
    <div key="injuries">
      <h2 className="text-xl font-bold text-white mb-2">יש פציעות או מגבלות? 🩹</h2>
      <p className="text-gray-400 text-sm mb-6">אופציונלי - עוזר לנו להתאים את התוכנית</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {INJURIES.map(inj => (
          <button
            key={inj}
            onClick={() => toggleInjury(inj)}
            className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
              data.injuries.includes(inj)
                ? 'border-orange-500 bg-orange-500 text-white'
                : 'border-gray-700 bg-gray-800 text-gray-300'
            }`}
          >
            {inj}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">לחץ לסימון, לחץ שוב לביטול</p>
    </div>,

    // Step 5: Personal details
    <div key="details">
      <h2 className="text-xl font-bold text-white mb-2">קצת עלייך 😊</h2>
      <p className="text-gray-400 text-sm mb-6">כל הנתונים אופציונליים</p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">שם (אופציונלי)</label>
          <input
            type="text"
            value={data.name}
            onChange={e => setData(d => ({ ...d, name: e.target.value }))}
            placeholder="כיצד לקרוא לך?"
            className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-right focus:outline-none focus:border-orange-500 placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">גיל (אופציונלי)</label>
          <input
            type="number"
            value={data.age}
            onChange={e => setData(d => ({ ...d, age: e.target.value }))}
            placeholder="גיל"
            className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-right focus:outline-none focus:border-orange-500 placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">משקל בק"ג (אופציונלי)</label>
          <input
            type="number"
            value={data.weightKg}
            onChange={e => setData(d => ({ ...d, weightKg: e.target.value }))}
            placeholder="משקל"
            className="w-full p-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-right focus:outline-none focus:border-orange-500 placeholder:text-gray-500"
          />
        </div>
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">שלב {step + 1} מתוך {totalSteps}</span>
          <span className="text-2xl font-bold text-orange-500">💪 המאמן</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer buttons */}
      <div className="px-4 py-6 space-y-3">
        <button
          onClick={() => step === totalSteps - 1 ? handleComplete() : setStep(s => s + 1)}
          disabled={!canProceed()}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {step === totalSteps - 1 ? '🚀 צור תוכנית אימון!' : 'המשך'}
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-full py-3 text-gray-500 font-medium"
          >
            חזור
          </button>
        )}
      </div>
    </div>
  )
}
