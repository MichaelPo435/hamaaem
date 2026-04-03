'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Search } from 'lucide-react'
import type { Exercise } from '@/types/exercise'

import strengthData from '@/data/exercises/strength.json'
import cardioData from '@/data/exercises/cardio.json'
import crossfitData from '@/data/exercises/crossfit.json'
import mobilityData from '@/data/exercises/mobility.json'

const ALL_EXERCISES: Exercise[] = [
  ...strengthData, ...cardioData, ...crossfitData, ...mobilityData
] as Exercise[]

const CATEGORIES = [
  { id: 'all', label: 'הכל' },
  { id: 'strength', label: 'כוח 💪' },
  { id: 'cardio', label: 'קרדיו 🏃' },
  { id: 'swimming', label: 'שחייה 🏊' },
  { id: 'crossfit', label: 'קרוספיט 🔥' },
  { id: 'mobility', label: 'מוביליטי 🌊' },
  { id: 'yoga', label: 'יוגה 🧘' },
  { id: 'stretching', label: 'מתיחות 🤸' },
]

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-900/50 text-green-300',
  intermediate: 'bg-yellow-900/50 text-yellow-300',
  advanced: 'bg-red-900/50 text-red-300',
}

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    return ALL_EXERCISES.filter(ex => {
      const matchSearch = !search || ex.nameHe.includes(search) || ex.nameEn.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'all' || ex.category === category
      return matchSearch && matchCat
    })
  }, [search, category])

  return (
    <div>
      <PageHeader title="ספריית תרגילים" subtitle={`${ALL_EXERCISES.length} תרגילים`} />

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חפש תרגיל..."
            className="w-full pr-9 pl-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white text-right focus:outline-none focus:border-orange-500 text-sm placeholder:text-gray-500"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === c.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-2">🔍</div>
              <p>לא נמצאו תרגילים</p>
            </div>
          ) : (
            filtered.map(ex => (
              <Link
                key={ex.id}
                href={`/library/${ex.slug}`}
                className="flex items-center justify-between bg-gray-800 rounded-xl p-3 hover:bg-gray-700 transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-white">{ex.nameHe}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{ex.nameEn}</div>
                  <div className="flex gap-1 mt-1">
                    {ex.muscleGroups.primary.slice(0, 2).map(m => (
                      <span key={m} className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
                        {muscleHe(m)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[ex.difficulty]}`}>
                    {DIFFICULTY_LABELS[ex.difficulty]}
                  </span>
                  {ex.videoYouTubeId && <span className="text-xs text-gray-500">📹 סרטון</span>}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function muscleHe(muscle: string): string {
  const MAP: Record<string, string> = {
    chest: 'חזה', back: 'גב', shoulders: 'כתפיים', biceps: 'ביצפס',
    triceps: 'טריצפס', core: 'קור', glutes: 'גלוטאוס', quads: 'קוודריספס',
    hamstrings: 'המסטרינג', calves: 'עגל', full_body: 'כל הגוף',
    hip_flexors: 'היפ פלקסור', neck: 'צוואר', forearms: 'אמה',
  }
  return MAP[muscle] || muscle
}
