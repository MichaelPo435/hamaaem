'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlanStore } from '@/lib/store/planStore'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import type { WorkoutSession, ActiveSet } from '@/types/workout'
import type { WorkoutSessionTemplate } from '@/types/plan'
import { ChevronLeft, Check, Timer, Plus, Minus } from 'lucide-react'

function templateToSession(template: WorkoutSessionTemplate, userId: string): WorkoutSession {
  return {
    id: template.id,
    userId,
    title: template.title,
    type: template.type,
    estimatedDurationMinutes: template.estimatedDurationMinutes,
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    blocks: template.blocks.map(block => ({
      id: block.id,
      title: block.title,
      type: block.type,
      rounds: block.rounds,
      exercises: block.exercises.map(ex => ({
        exerciseSlug: ex.exerciseSlug,
        nameHe: ex.nameHe,
        notes: ex.notes,
        durationSeconds: ex.durationSeconds,
        distanceMeters: ex.distanceMeters,
        completed: false,
        sets: ex.sets
          ? Array.from({ length: ex.sets }, (_, i) => ({
              setNumber: i + 1,
              targetReps: ex.reps,
              completed: false,
            }))
          : [],
      })),
    })),
  }
}

export default function WorkoutSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const router = useRouter()
  const activePlan = usePlanStore(s => s.activePlan)
  const { activeSession, startSession, updateSet, completeExercise, completeSession } = useWorkoutStore()

  const [elapsed, setElapsed] = useState(0)
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)

  // Find session template from plan
  useEffect(() => {
    if (!activeSession || activeSession.id !== sessionId) {
      let template: WorkoutSessionTemplate | undefined
      activePlan?.weeks.forEach(w => {
        w.days.forEach(d => {
          if (d.session?.id === sessionId) template = d.session
        })
      })
      if (template) {
        startSession(templateToSession(template, 'user'))
      }
    }
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Rest timer
  useEffect(() => {
    if (restTimer === null || restTimer <= 0) {
      setRestTimer(null)
      return
    }
    const t = setTimeout(() => setRestTimer(r => r !== null ? r - 1 : null), 1000)
    return () => clearTimeout(t)
  }, [restTimer])

  // Auto-expand first block
  useEffect(() => {
    if (activeSession && !expandedBlock && activeSession.blocks[0]) {
      setExpandedBlock(activeSession.blocks[0].id)
    }
  }, [activeSession]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const allDone = activeSession?.blocks.every(b => b.exercises.every(e => e.completed))

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="text-3xl mb-4">🔍</div>
        <p className="text-gray-400 mb-4">אימון לא נמצא</p>
        <Link href="/plan" className="text-orange-500 font-medium">חזור לתוכנית</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/plan" className="p-2 rounded-xl hover:bg-gray-800">
            <ChevronLeft size={20} className="text-gray-400" />
          </Link>
          <div className="text-center">
            <div className="font-bold text-white text-sm">{activeSession.title}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1 justify-center">
              <Timer size={10} /> {formatTime(elapsed)}
            </div>
          </div>
          {allDone ? (
            <button
              onClick={() => { completeSession(); router.push('/workout/history') }}
              className="bg-green-500 text-white px-3 py-1.5 rounded-xl text-sm font-bold"
            >
              סיים
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </div>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {restTimer !== null && restTimer > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
            onClick={() => setRestTimer(null)}
          >
            <div className="bg-gray-800 rounded-3xl p-8 text-center mx-4">
              <div className="text-5xl font-bold text-orange-500 mb-2">{restTimer}</div>
              <div className="text-gray-300 mb-4">שניות מנוחה</div>
              <button
                className="text-sm text-gray-500 underline"
                onClick={() => setRestTimer(null)}
              >
                דלג
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workout blocks */}
      <div className="px-4 py-4 space-y-3 pb-28">
        {activeSession.blocks.map(block => {
          const blockDone = block.exercises.every(e => e.completed)
          const isExpanded = expandedBlock === block.id

          return (
            <div key={block.id} className="border border-gray-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  {blockDone && <Check size={16} className="text-green-500" />}
                  <span className="font-semibold text-sm text-gray-200">{block.title}</span>
                  {block.rounds && <span className="text-xs text-gray-500">{block.rounds} סטים</span>}
                </div>
                <span className="text-xs text-gray-500">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4 bg-gray-900">
                  {block.exercises.map(ex => (
                    <ExerciseRow
                      key={ex.exerciseSlug}
                      exercise={ex}
                      blockId={block.id}
                      onUpdateSet={(setNum, data) => updateSet(block.id, ex.exerciseSlug, setNum, data)}
                      onComplete={() => {
                        completeExercise(block.id, ex.exerciseSlug)
                        setRestTimer(60)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {allDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-950/30 rounded-2xl p-6 text-center"
          >
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-bold text-green-400 text-lg">כל הכבוד!</div>
            <div className="text-sm text-gray-400 mb-4">השלמת את האימון</div>
            <button
              onClick={() => { completeSession(); router.push('/workout/history') }}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-bold"
            >
              סיים אימון
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

interface ExerciseRowProps {
  exercise: WorkoutSession['blocks'][0]['exercises'][0]
  blockId: string
  onUpdateSet: (setNum: number, data: Partial<ActiveSet>) => void
  onComplete: () => void
}

function ExerciseRow({ exercise, onUpdateSet, onComplete }: ExerciseRowProps) {
  return (
    <div className={`${exercise.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <Link href={`/library/${exercise.exerciseSlug}`} className="font-semibold text-white text-sm hover:text-orange-400">
          {exercise.nameHe}
        </Link>
        {!exercise.completed && (
          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-xs text-green-400 bg-green-950/40 px-3 py-1 rounded-lg font-medium"
          >
            <Check size={12} />
            סיים תרגיל
          </button>
        )}
      </div>

      {/* Timed exercise */}
      {exercise.durationSeconds && !exercise.sets.length && (
        <div className="text-sm text-gray-400">
          ⏱ {exercise.durationSeconds} שניות
        </div>
      )}

      {/* Distance exercise */}
      {exercise.distanceMeters && !exercise.sets.length && (
        <div className="text-sm text-gray-400">
          📏 {exercise.distanceMeters} מטרים
        </div>
      )}

      {/* Sets */}
      {exercise.sets.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-4 text-xs text-gray-500 font-medium px-1">
            <span>סט</span>
            <span>חזרות</span>
            <span>ק"ג</span>
            <span></span>
          </div>
          {exercise.sets.map(set => (
            <SetRow
              key={set.setNumber}
              set={set}
              onUpdate={(data) => onUpdateSet(set.setNumber, data)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SetRow({ set, onUpdate }: { set: ActiveSet; onUpdate: (data: Partial<ActiveSet>) => void }) {
  return (
    <div className={`grid grid-cols-4 items-center gap-2 p-2 rounded-xl ${set.completed ? 'bg-green-950/30' : 'bg-gray-800'}`}>
      <span className="text-sm font-medium text-gray-400">{set.setNumber}</span>

      <div className="flex items-center gap-1">
        <button onClick={() => onUpdate({ actualReps: Math.max(0, (set.actualReps || 0) - 1) })}
          className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
          <Minus size={10} className="text-gray-300" />
        </button>
        <span className="text-sm font-bold w-6 text-center text-white">{set.actualReps || set.targetReps || '-'}</span>
        <button onClick={() => onUpdate({ actualReps: (set.actualReps || 0) + 1 })}
          className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
          <Plus size={10} className="text-gray-300" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => onUpdate({ weightKg: Math.max(0, (set.weightKg || 0) - 2.5) })}
          className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
          <Minus size={10} className="text-gray-300" />
        </button>
        <span className="text-xs font-bold w-8 text-center text-white">{set.weightKg || 0}</span>
        <button onClick={() => onUpdate({ weightKg: (set.weightKg || 0) + 2.5 })}
          className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
          <Plus size={10} className="text-gray-300" />
        </button>
      </div>

      <button
        onClick={() => onUpdate({ completed: !set.completed })}
        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          set.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-500'
        }`}
      >
        <Check size={14} />
      </button>
    </div>
  )
}
