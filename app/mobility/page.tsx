'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import type { MobilityRoutine } from '@/types/exercise'
import routinesData from '@/data/mobilityRoutines.json'

const ROUTINES: MobilityRoutine[] = routinesData as MobilityRoutine[]

const CATEGORIES = [
  { id: 'all', label: 'הכל' },
  { id: 'mobility', label: 'מוביליטי 🌊' },
  { id: 'yoga', label: 'יוגה 🧘' },
  { id: 'stretching', label: 'מתיחות 🤸' },
  { id: 'foam_rolling', label: 'פוםרולר 🎯' },
]

const CATEGORY_EMOJIS: Record<string, string> = {
  mobility: '🌊', yoga: '🧘', stretching: '🤸', foam_rolling: '🎯',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-900/50 text-green-300',
  intermediate: 'bg-yellow-900/50 text-yellow-300',
  advanced: 'bg-red-900/50 text-red-300',
}

export default function MobilityPage() {
  const [category, setCategory] = useState('all')

  const filtered = ROUTINES.filter(r => category === 'all' || r.category === category)

  return (
    <div>
      <PageHeader
        title="מוביליטי ויוגה"
        subtitle="שגרות מתיחות ומוביליטי"
      />

      <div className="px-4 space-y-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === c.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Routines grid */}
        <div className="space-y-3">
          {filtered.map(routine => (
            <Link
              key={routine.id}
              href={`/mobility/${routine.slug}`}
              className="block bg-gray-800 border border-gray-700 rounded-2xl p-4 hover:border-purple-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CATEGORY_EMOJIS[routine.category]}</span>
                    <span className="font-bold text-white">{routine.titleHe}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 mr-7">{routine.descriptionHe}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mr-7">
                <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[routine.difficulty]}`}>
                  {DIFFICULTY_LABELS[routine.difficulty]}
                </span>
                <span className="text-xs text-gray-500">⏱ {routine.durationMinutes} דקות</span>
                <span className="text-xs text-gray-500">📋 {routine.exercises.length} תרגילים</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
