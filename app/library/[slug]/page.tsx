import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { Exercise } from '@/types/exercise'
import { ExerciseVideoEmbed } from '@/components/exercise/ExerciseVideoEmbed'

import strengthData from '@/data/exercises/strength.json'
import cardioData from '@/data/exercises/cardio.json'
import crossfitData from '@/data/exercises/crossfit.json'
import mobilityData from '@/data/exercises/mobility.json'

const ALL_EXERCISES: Exercise[] = [
  ...strengthData, ...cardioData, ...crossfitData, ...mobilityData
] as Exercise[]

const MUSCLE_LABELS: Record<string, string> = {
  chest: 'חזה', back: 'גב', shoulders: 'כתפיים', biceps: 'ביצפס',
  triceps: 'טריצפס', core: 'קור', glutes: 'גלוטאוס', quads: 'קוודריספס',
  hamstrings: 'המסטרינג', calves: 'עגל', full_body: 'כל הגוף',
  hip_flexors: 'היפ פלקסור', neck: 'צוואר', forearms: 'אמה',
}

const CATEGORY_LABELS: Record<string, string> = {
  strength: 'כוח', cardio: 'קרדיו', swimming: 'שחייה', crossfit: 'קרוספיט',
  mobility: 'מוביליטי', yoga: 'יוגה', stretching: 'מתיחות', plyometric: 'פליומטרי',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם',
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-900/50 text-green-300',
  intermediate: 'bg-yellow-900/50 text-yellow-300',
  advanced: 'bg-red-900/50 text-red-300',
}

export default async function ExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const exercise = ALL_EXERCISES.find(ex => ex.slug === slug)

  if (!exercise) return notFound()

  return (
    <div>
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center gap-3">
        <Link href="/library" className="p-2 rounded-xl bg-gray-800">
          <ChevronLeft size={18} className="text-gray-300" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{exercise.nameHe}</h1>
          <p className="text-sm text-gray-400">{exercise.nameEn}</p>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* Video */}
        {exercise.videoYouTubeId && (
          <ExerciseVideoEmbed youtubeId={exercise.videoYouTubeId} title={exercise.nameHe} />
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
            {DIFFICULTY_LABELS[exercise.difficulty]}
          </span>
          <span className="text-sm px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 font-medium">
            {CATEGORY_LABELS[exercise.category] || exercise.category}
          </span>
        </div>

        {/* Muscle groups */}
        <div>
          <h3 className="text-sm font-bold text-gray-300 mb-2">שרירים עובדים</h3>
          <div className="flex flex-wrap gap-2">
            {exercise.muscleGroups.primary.map(m => (
              <span key={m} className="text-sm px-3 py-1 rounded-full bg-teal-900/40 text-teal-300 font-medium">
                🔥 {MUSCLE_LABELS[m] || m}
              </span>
            ))}
            {exercise.muscleGroups.secondary.map(m => (
              <span key={m} className="text-sm px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                {MUSCLE_LABELS[m] || m}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="text-base font-bold text-white mb-3">הוראות ביצוע</h3>
          <ol className="space-y-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-300 leading-relaxed pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="bg-amber-950/30 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-amber-300 mb-2">💡 טיפים</h3>
            <ul className="space-y-2">
              {exercise.tips.map((tip, i) => (
                <li key={i} className="text-sm text-amber-200/80 flex gap-2">
                  <span>•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Equipment */}
        {exercise.equipment.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-300 mb-2">ציוד נדרש</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.equipment.map(eq => (
                <span key={eq} className="text-sm px-3 py-1 rounded-full bg-gray-800 text-gray-300">
                  {eq === 'none' ? 'ללא ציוד' : eq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
