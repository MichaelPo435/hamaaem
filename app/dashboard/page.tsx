'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/lib/store/userStore'
import { usePlanStore } from '@/lib/store/planStore'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Dumbbell, Play, BookOpen, Waves, Plus, TrendingUp } from 'lucide-react'

const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const MOTIVATIONAL_QUOTES = [
  'המנוחה היא חלק מהאימון. הגוף שלך בונה כוח עכשיו.',
  'גדולים לא נולדים — הם נבנים, שריר אחר שריר.',
  'הקושי של היום הוא הכוח של מחר.',
  'כל אימון שעשית כבר שינה אותך לטוב.',
  'הגוף שואל "למה?" — הנפש עונה "כי אני יכול."',
  'ניצחון אמיתי הוא להתחיל שוב ושוב.',
  'אתה לא מתחרה באף אחד — רק בגרסה של אתמול.',
  'מנוחה חכמה היא חלק מהמשחק.',
  'כל צעד קטן לקראת המטרה — הוא כבר הצלחה.',
  'הגוף מרפא, הנפש מתחזקת. מחר נחזור.',
]

export default function DashboardPage() {
  const user = useUserStore(s => s.user)
  const activePlan = usePlanStore(s => s.activePlan)
  const history = useWorkoutStore(s => s.history)
  const motivationalQuote = useMemo(
    () => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    []
  )

  const todayDow = new Date().getDay()
  const todayName = HEB_DAYS[todayDow]

  // Find today's workout in plan
  const todaySession = activePlan?.weeks[0]?.days.find(d => d.dayOfWeek === todayDow && !d.isRestDay)?.session

  const thisWeekWorkouts = history.filter(w => {
    const d = new Date(w.completedAt || w.startedAt || '')
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    return d >= weekStart && w.status === 'completed'
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'בוקר טוב'
    if (h < 17) return 'צהריים טובים'
    return 'ערב טוב'
  })()

  return (
    <div>
      <PageHeader
        title={`${greeting}${user?.name ? `, ${user.name}` : ''}! 👋`}
        subtitle={`יום ${todayName}`}
      />

      <div className="px-4 space-y-4">
        {/* Today's workout */}
        <div className="rounded-2xl overflow-hidden">
          {todaySession ? (
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white">
              <div className="text-sm font-medium opacity-80 mb-1">האימון של היום</div>
              <div className="text-xl font-bold mb-1">{todaySession.title}</div>
              <div className="text-sm opacity-80 mb-4">
                {todaySession.estimatedDurationMinutes} דקות
                {activePlan && ` · ${activePlan.title}`}
              </div>
              <Link
                href={`/workout/${todaySession.id}`}
                className="inline-flex items-center gap-2 bg-white text-teal-500 px-5 py-2.5 rounded-xl font-bold text-sm"
              >
                <Play size={16} fill="currentColor" />
                התחל אימון
              </Link>
            </div>
          ) : activePlan ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-5">
              <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">מחשבה להיום</div>
              <p className="text-gray-200 text-base font-medium leading-relaxed text-right">{motivationalQuote}</p>
            </div>
          ) : (
            <div className="bg-teal-950/30 border-2 border-dashed border-teal-800 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold text-gray-200 mb-1">אין תוכנית אימון פעילה</div>
              <div className="text-sm text-gray-400 mb-4">בנה תוכנית אישית עם התרגילים שלך</div>
              <Link
                href="/plan/create"
                className="inline-flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                בנה תוכנית
              </Link>
            </div>
          )}
        </div>

        {/* This week stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="text-2xl font-bold text-teal-500">{thisWeekWorkouts.length}</div>
            <div className="text-sm text-gray-400">אימונים השבוע</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="text-2xl font-bold text-teal-500">{history.length}</div>
            <div className="text-sm text-gray-400">סה"כ אימונים</div>
          </div>
        </div>

        {/* Quick access */}
        <div>
          <h3 className="text-base font-bold text-white mb-3">גישה מהירה</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/plan" className="bg-blue-950/40 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Dumbbell size={18} className="text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">תוכנית</div>
                <div className="text-xs text-gray-400">הצג שבועות</div>
              </div>
            </Link>
            <Link href="/library" className="bg-green-950/40 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-900/50 rounded-xl flex items-center justify-center">
                <BookOpen size={18} className="text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">ספריה</div>
                <div className="text-xs text-gray-400">כל התרגילים</div>
              </div>
            </Link>
            <Link href="/mobility" className="bg-purple-950/40 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Waves size={18} className="text-purple-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">מוביליטי</div>
                <div className="text-xs text-gray-400">יוגה ומתיחות</div>
              </div>
            </Link>
            <Link href="/workout/history" className="bg-pink-950/40 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-900/50 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-pink-400" />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">מעקב</div>
                <div className="text-xs text-gray-400">היסטוריה</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent workouts */}
        {history.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-white mb-3">אימונים אחרונים</h3>
            <div className="space-y-2">
              {history.slice(0, 3).map(w => (
                <div key={w.id} className="bg-gray-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-white">{w.title}</div>
                    <div className="text-xs text-gray-400">
                      {w.completedAt && new Date(w.completedAt).toLocaleDateString('he-IL')}
                      {w.actualDurationMinutes && ` · ${w.actualDurationMinutes} דקות`}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${w.status === 'completed' ? 'bg-green-400' : 'bg-gray-600'}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
