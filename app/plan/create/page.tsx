'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { useUserStore } from '@/lib/store/userStore'
import { usePlanStore } from '@/lib/store/planStore'
import type { TrainingPlan } from '@/types/plan'
import type { Exercise } from '@/types/exercise'
import { Search, Plus, Minus, Trash2, Check } from 'lucide-react'
import strengthData from '@/data/exercises/strength.json'
import cardioData from '@/data/exercises/cardio.json'
import crossfitData from '@/data/exercises/crossfit.json'
import mobilityData from '@/data/exercises/mobility.json'

const ALL_EXERCISES: Exercise[] = [
  ...strengthData,
  ...cardioData,
  ...crossfitData,
  ...mobilityData,
] as Exercise[]

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
const NUM_WEEKS = 4

type ExerciseEntry = {
  slug: string
  nameHe: string
  sets: number
  reps: string
  weight: string
}

type DaySession = {
  title: string
  exercises: ExerciseEntry[]
}

// sessions[weekIdx][dow]
type AllSessions = Record<number, Record<number, DaySession>>

export default function CreatePlanPage() {
  const router = useRouter()
  const user = useUserStore(s => s.user)
  const addPlan = usePlanStore(s => s.addPlan)

  const [step, setStep] = useState(1)
  const [planName, setPlanName] = useState('תוכנית האימון שלי')
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 2, 4])
  const [sessions, setSessions] = useState<AllSessions>({})
  const [activeWeekIdx, setActiveWeekIdx] = useState(0)
  const [activeDayIdx, setActiveDayIdx] = useState(0)
  const [search, setSearch] = useState('')

  const activeDay = selectedDays[activeDayIdx]
  const weekSessions = sessions[activeWeekIdx] ?? {}
  const session: DaySession = weekSessions[activeDay] ?? { title: `אימון ${DAY_NAMES[activeDay]}`, exercises: [] }

  const filteredExercises = useMemo(() => {
    if (!search.trim()) return ALL_EXERCISES.slice(0, 25)
    const q = search.toLowerCase()
    return ALL_EXERCISES.filter(e =>
      e.nameHe.includes(q) ||
      e.nameEn.toLowerCase().includes(q) ||
      e.tags?.some((t: string) => t.includes(q))
    ).slice(0, 25)
  }, [search])

  function toggleDay(dow: number) {
    setSelectedDays(prev =>
      prev.includes(dow) ? prev.filter(d => d !== dow) : [...prev, dow].sort((a, b) => a - b)
    )
  }

  function updateSession(updates: Partial<DaySession>) {
    setSessions(prev => ({
      ...prev,
      [activeWeekIdx]: {
        ...prev[activeWeekIdx],
        [activeDay]: { ...session, ...updates },
      },
    }))
  }

  function addExercise(ex: Exercise) {
    if (session.exercises.find(e => e.slug === ex.slug)) return
    updateSession({
      exercises: [...session.exercises, { slug: ex.slug, nameHe: ex.nameHe, sets: 3, reps: '8-10', weight: '' }],
    })
  }

  function removeExercise(slug: string) {
    updateSession({ exercises: session.exercises.filter(e => e.slug !== slug) })
  }

  function updateExercise(slug: string, field: 'sets' | 'reps' | 'weight', value: string | number) {
    updateSession({
      exercises: session.exercises.map(e => e.slug === slug ? { ...e, [field]: value } : e),
    })
  }

  function savePlan() {
    if (!user) return

    const weeks = Array.from({ length: NUM_WEEKS }, (_, weekIdx) => ({
      weekNumber: weekIdx + 1,
      theme: `שבוע ${weekIdx + 1}`,
      days: Array.from({ length: 7 }, (_, dow) => {
        if (!selectedDays.includes(dow)) {
          return { dayOfWeek: dow as 0|1|2|3|4|5|6, isRestDay: true }
        }
        const s = sessions[weekIdx]?.[dow] ?? { title: `אימון ${DAY_NAMES[dow]}`, exercises: [] }
        return {
          dayOfWeek: dow as 0|1|2|3|4|5|6,
          isRestDay: false,
          session: {
            id: `w${weekIdx + 1}-d${dow}`,
            title: s.title,
            type: user.goals[0],
            estimatedDurationMinutes: user.sessionDuration,
            blocks: [{
              id: `w${weekIdx + 1}-d${dow}-main`,
              title: 'בלוק ראשי',
              type: 'main' as const,
              exercises: s.exercises.map(e => ({
                exerciseSlug: e.slug,
                nameHe: e.nameHe,
                sets: e.sets,
                reps: e.reps,
                weight: e.weight || undefined,
              })),
            }],
          },
        }
      }),
    }))

    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      generatedBy: 'manual',
      title: planName,
      description: 'תוכנית אימון אישית',
      type: user.goals[0],
      durationWeeks: NUM_WEEKS,
      level: user.experienceLevel,
      status: 'active',
      weeks,
    }

    addPlan(plan)
    router.replace('/plan')
  }

  if (!user) return null

  // Step 1: Plan name + day selection
  if (step === 1) {
    return (
      <div>
        <PageHeader title="בניית תוכנית" subtitle="בנה תוכנית אימון משלך" />
        <div className="px-4 space-y-6 pb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">שם התוכנית</label>
            <input
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm"
              placeholder="תוכנית האימון שלי"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">ימי אימון</label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAY_NAMES.map((name, dow) => (
                <button
                  key={dow}
                  onClick={() => toggleDay(dow)}
                  className={`py-3 rounded-xl text-xs font-medium transition-all ${
                    selectedDays.includes(dow)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {name.slice(0, 2)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">{selectedDays.length} ימי אימון בשבוע</p>
          </div>

          <button
            onClick={() => { setActiveWeekIdx(0); setActiveDayIdx(0); setStep(2) }}
            disabled={selectedDays.length === 0 || !planName.trim()}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base disabled:opacity-40"
          >
            הגדר תרגילים ←
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Exercise builder per week × day
  return (
    <div className="pb-8">
      {/* Sticky header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-10 px-4 py-3">
        {/* Week selector */}
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {Array.from({ length: NUM_WEEKS }, (_, i) => (
            <button
              key={i}
              onClick={() => { setActiveWeekIdx(i); setActiveDayIdx(0); setSearch('') }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeWeekIdx === i
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              שבוע {i + 1}
            </button>
          ))}
          <button
            onClick={savePlan}
            className="flex-shrink-0 mr-auto bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
          >
            שמור ✓
          </button>
        </div>

        {/* Day navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (activeDayIdx === 0) setStep(1)
              else { setActiveDayIdx(i => i - 1); setSearch('') }
            }}
            className="text-gray-400 text-sm px-2 py-1"
          >
            {activeDayIdx === 0 ? '→ חזור' : `→ ${DAY_NAMES[selectedDays[activeDayIdx - 1]]}`}
          </button>
          <span className="font-bold text-white text-sm">יום {DAY_NAMES[activeDay]}</span>
          {activeDayIdx < selectedDays.length - 1 ? (
            <button
              onClick={() => { setActiveDayIdx(i => i + 1); setSearch('') }}
              className="text-orange-400 text-sm font-medium px-2 py-1"
            >
              {DAY_NAMES[selectedDays[activeDayIdx + 1]]} ←
            </button>
          ) : (
            <span className="text-xs text-gray-600 px-2">יום אחרון</span>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Session name */}
        <input
          value={session.title}
          onChange={e => updateSession({ title: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm"
          placeholder="שם האימון"
        />

        {/* Added exercises */}
        {session.exercises.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-2">תרגילים ({session.exercises.length})</h3>
            <div className="space-y-2">
              {session.exercises.map(ex => (
                <div key={ex.slug} className="bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{ex.nameHe}</span>
                    <button onClick={() => removeExercise(ex.slug)} className="p-1">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">סטים:</span>
                      <button
                        onClick={() => updateExercise(ex.slug, 'sets', Math.max(1, ex.sets - 1))}
                        className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center"
                      >
                        <Minus size={10} className="text-gray-300" />
                      </button>
                      <span className="text-sm font-bold text-white w-5 text-center">{ex.sets}</span>
                      <button
                        onClick={() => updateExercise(ex.slug, 'sets', ex.sets + 1)}
                        className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center"
                      >
                        <Plus size={10} className="text-gray-300" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">חזרות:</span>
                      <input
                        value={ex.reps}
                        onChange={e => updateExercise(ex.slug, 'reps', e.target.value)}
                        className="w-16 bg-gray-700 text-white text-xs rounded-lg px-2 py-1.5 text-center"
                        placeholder="8-10"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">משקל:</span>
                      <input
                        value={ex.weight}
                        onChange={e => updateExercise(ex.slug, 'weight', e.target.value)}
                        className="w-16 bg-gray-700 text-white text-xs rounded-lg px-2 py-1.5 text-center"
                        placeholder='ק"ג'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and add exercises */}
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-2">הוסף תרגיל</h3>
          <div className="relative mb-3">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="חפש תרגיל בעברית או אנגלית..."
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl pr-9 pl-4 py-2.5 placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {filteredExercises.map(ex => {
              const added = session.exercises.some(e => e.slug === ex.slug)
              return (
                <button
                  key={ex.slug}
                  onClick={() => addExercise(ex)}
                  disabled={added}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-right transition-all ${
                    added
                      ? 'bg-green-950/30 border border-green-800/50'
                      : 'bg-gray-800 active:bg-gray-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium text-white">{ex.nameHe}</div>
                    <div className="text-xs text-gray-500">{ex.nameEn}</div>
                  </div>
                  {added
                    ? <Check size={16} className="text-green-400 flex-shrink-0 mr-2" />
                    : <Plus size={16} className="text-orange-400 flex-shrink-0 mr-2" />
                  }
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
