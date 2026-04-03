'use client'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/userStore'
import { usePlanStore } from '@/lib/store/planStore'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'

const GOAL_LABELS: Record<string, string> = {
  running: 'ריצה 🏃', crossfit: 'קרוספיט 🔥', weightlifting: 'הרמת משקולות 🏋️',
  swimming: 'שחייה 🏊', hybrid: 'היברידי ⚡', mobility: 'מוביליטי 🧘',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'מתחיל 🌱', intermediate: 'בינוני 🔥', advanced: 'מתקדם ⚡',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: 'חדר כושר מלא', barbell: 'מוט + משקולות', dumbbells: 'משקולות יד',
  pull_up_bar: 'מוט מתח', kettlebells: 'קטלבלים', resistance_bands: 'גומיות', none: 'ללא ציוד',
}

export default function ProfilePage() {
  const router = useRouter()
  const user = useUserStore(s => s.user)
  const resetUser = useUserStore(s => s.resetUser)
  const history = useWorkoutStore(s => s.history)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-400 mb-4">לא נמצא פרופיל</p>
          <Link href="/onboarding" className="text-orange-500 font-medium">התחל מחדש</Link>
        </div>
      </div>
    )
  }

  function handleReset() {
    if (confirm('האם למחוק את כל הנתונים ולהתחיל מחדש?')) {
      resetUser()
      router.replace('/onboarding')
    }
  }

  const completed = history.filter(w => w.status === 'completed')

  return (
    <div>
      <PageHeader title="הפרופיל שלי" />

      <div className="px-4 space-y-4">
        {/* User card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          <div className="text-4xl mb-2">💪</div>
          <div className="text-xl font-bold">{user.name || 'מתאמן'}</div>
          <div className="text-sm opacity-80 mt-1">{LEVEL_LABELS[user.experienceLevel]}</div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-white/20">
            <div>
              <div className="text-xl font-bold">{completed.length}</div>
              <div className="text-xs opacity-70">אימונים</div>
            </div>
            {user.age && (
              <div>
                <div className="text-xl font-bold">{user.age}</div>
                <div className="text-xs opacity-70">גיל</div>
              </div>
            )}
            {user.weightKg && (
              <div>
                <div className="text-xl font-bold">{user.weightKg}</div>
                <div className="text-xs opacity-70">ק"ג</div>
              </div>
            )}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3 text-sm">מטרות אימון</h3>
          <div className="flex flex-wrap gap-2">
            {user.goals.map(g => (
              <span key={g} className="text-sm px-3 py-1 bg-orange-900/40 text-orange-300 rounded-full font-medium">
                {GOAL_LABELS[g] || g}
              </span>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3 text-sm">לוח זמנים</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-400">ימים בשבוע:</span>
              <span className="font-semibold text-white mr-2">{user.weeklyAvailability}</span>
            </div>
            <div>
              <span className="text-gray-400">משך אימון:</span>
              <span className="font-semibold text-white mr-2">{user.sessionDuration}′</span>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-gray-800 rounded-2xl p-4">
          <h3 className="font-bold text-white mb-3 text-sm">ציוד</h3>
          <div className="flex flex-wrap gap-2">
            {user.equipment.map(e => (
              <span key={e} className="text-sm px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full">
                {EQUIPMENT_LABELS[e] || e}
              </span>
            ))}
          </div>
        </div>

        {/* Injuries */}
        {user.injuries.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="font-bold text-white mb-3 text-sm">מגבלות/פציעות</h3>
            <div className="flex flex-wrap gap-2">
              {user.injuries.map(inj => (
                <span key={inj} className="text-sm px-3 py-1 bg-red-900/40 text-red-300 rounded-full">
                  {inj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pb-4">
          <Link
            href="/plan/generate"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-orange-500 text-orange-500 font-bold"
          >
            <RefreshCw size={18} />
            צור תוכנית חדשה
          </Link>
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-900 text-red-400 font-medium text-sm"
          >
            <Trash2 size={16} />
            מחק הכל והתחל מחדש
          </button>
        </div>
      </div>
    </div>
  )
}
