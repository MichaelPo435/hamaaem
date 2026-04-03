'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Play, Pause, SkipForward, Check } from 'lucide-react'
import type { MobilityRoutine } from '@/types/exercise'
import routinesData from '@/data/mobilityRoutines.json'

const ROUTINES: MobilityRoutine[] = routinesData as MobilityRoutine[]

export default function RoutinePage({ params }: { params: Promise<{ routineId: string }> }) {
  const { routineId } = use(params)
  const routine = ROUTINES.find(r => r.slug === routineId)

  const [started, setStarted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [phase, setPhase] = useState<'left' | 'right' | 'done'>('left')
  const [timeLeft, setTimeLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [completed, setCompleted] = useState(false)

  const current = routine?.exercises[currentIdx]
  const isSingleSide = current?.sides === 'single'

  useEffect(() => {
    if (!started || !current || paused) return
    if (timeLeft <= 0) {
      if (isSingleSide && phase === 'left') {
        setPhase('right')
        setTimeLeft(current.holdSeconds)
      } else {
        // Move to next exercise
        if (routine && currentIdx < routine.exercises.length - 1) {
          setCurrentIdx(i => i + 1)
          setPhase('left')
          setTimeLeft(routine.exercises[currentIdx + 1].holdSeconds)
        } else {
          setCompleted(true)
        }
      }
      return
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [started, timeLeft, paused, current, phase, isSingleSide, currentIdx, routine])

  function handleStart() {
    if (routine && routine.exercises[0]) {
      setStarted(true)
      setTimeLeft(routine.exercises[0].holdSeconds)
    }
  }

  function handleNext() {
    if (!routine) return
    if (isSingleSide && phase === 'left') {
      setPhase('right')
      setTimeLeft(current!.holdSeconds)
    } else if (currentIdx < routine.exercises.length - 1) {
      setCurrentIdx(i => i + 1)
      setPhase('left')
      setTimeLeft(routine.exercises[currentIdx + 1].holdSeconds)
    } else {
      setCompleted(true)
    }
  }

  if (!routine) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">שגרה לא נמצאה</p>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-4">🎉</motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">כל הכבוד!</h2>
        <p className="text-gray-400 mb-6">השלמת את {routine.titleHe}</p>
        <Link href="/mobility" className="bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold">
          חזור לשגרות
        </Link>
      </div>
    )
  }

  if (!started) {
    return (
      <div>
        {/* Header */}
        <div className="px-4 pt-6 pb-4 flex items-center gap-3">
          <Link href="/mobility" className="p-2 rounded-xl bg-gray-800">
            <ChevronLeft size={18} className="text-gray-300" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{routine.titleHe}</h1>
            <p className="text-sm text-gray-400">{routine.durationMinutes} דקות · {routine.exercises.length} תרגילים</p>
          </div>
        </div>

        <div className="px-4 space-y-4">
          <p className="text-gray-300">{routine.descriptionHe}</p>

          {/* Exercise list preview */}
          <div>
            <h3 className="font-bold text-white mb-3">רשימת תרגילים</h3>
            <div className="space-y-2">
              {routine.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <span className="w-6 h-6 bg-purple-900/60 text-purple-300 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-medium text-sm text-white">{ex.nameHe}</div>
                    <div className="text-xs text-gray-400">
                      {ex.holdSeconds} שניות
                      {ex.sides === 'single' ? ' × 2 צדדים' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-purple-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2"
          >
            <Play size={20} fill="white" />
            התחל
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentIdx / routine.exercises.length) + (1 / routine.exercises.length) * (1 - timeLeft / (current?.holdSeconds || 1))) * 100

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <Link href="/mobility" className="p-2 rounded-xl bg-gray-800">
          <ChevronLeft size={18} className="text-gray-300" />
        </Link>
        <span className="text-sm text-gray-400">{currentIdx + 1} / {routine.exercises.length}</span>
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="px-4 mb-6">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500 rounded-full"
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current exercise */}
      <div className="flex-1 px-4 flex flex-col items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIdx}-${phase}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{current?.nameHe}</h2>
            {isSingleSide && (
              <div className="inline-block bg-purple-900/50 text-purple-300 px-4 py-1 rounded-full text-sm font-medium mb-4">
                צד {phase === 'left' ? 'ימין' : 'שמאל'}
              </div>
            )}
            <p className="text-gray-400 text-sm mb-8">{current?.instruction}</p>

            {/* Timer */}
            <div className="w-40 h-40 mx-auto rounded-full bg-purple-950/40 border-4 border-purple-800 flex items-center justify-center mb-8">
              <motion.span
                key={timeLeft}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-purple-400"
              >
                {timeLeft}
              </motion.span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-4 py-8 flex items-center justify-center gap-6">
        <button
          onClick={() => setPaused(p => !p)}
          className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center"
        >
          {paused ? <Play size={22} className="text-gray-300" /> : <Pause size={22} className="text-gray-300" />}
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold"
        >
          הבא <SkipForward size={18} />
        </button>
      </div>
    </div>
  )
}
