'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/userStore'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Trash2, Camera } from 'lucide-react'
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
  const updateUser = useUserStore(s => s.updateUser)
  const resetUser = useUserStore(s => s.resetUser)
  const history = useWorkoutStore(s => s.history)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateUser({ profileImage: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const completed = history.filter(w => w.status === 'completed')

  const thisWeekWorkouts = history.filter(w => {
    const d = new Date(w.completedAt || w.startedAt || '')
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return d >= weekStart && w.status === 'completed'
  })

  return (
    <div>
      <PageHeader title="הפרופיל שלי" />

      <div className="px-4 space-y-4">
        {/* User card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-4">
            {/* Profile image */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full overflow-hidden bg-orange-400/50 flex items-center justify-center"
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt="פרופיל" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">💪</span>
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 left-0 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow"
              >
                <Camera size={11} className="text-orange-500" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Name + level */}
            <div>
              <div className="text-2xl font-bold leading-tight">{user.name || 'מתאמן'}</div>
              <div className="text-sm opacity-80 mt-0.5">{LEVEL_LABELS[user.experienceLevel]}</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-5 pt-4 border-t border-white/20">
            <div>
              <div className="text-2xl font-bold">{thisWeekWorkouts.length}</div>
              <div className="text-xs opacity-70">אימונים השבוע</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{completed.length}</div>
              <div className="text-xs opacity-70">סה״כ אימונים</div>
            </div>
            {user.age && (
              <div>
                <div className="text-2xl font-bold">{user.age}</div>
                <div className="text-xs opacity-70">גיל</div>
              </div>
            )}
            {user.weightKg && (
              <div>
                <div className="text-2xl font-bold">{user.weightKg}</div>
                <div className="text-xs opacity-70">ק״ג</div>
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
        <div className="pb-4">
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
