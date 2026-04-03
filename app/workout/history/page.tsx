'use client'
import { useWorkoutStore } from '@/lib/store/workoutStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { TrendingUp, Clock, Dumbbell } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  running: 'ריצה 🏃', crossfit: 'קרוספיט 🔥', weightlifting: 'הרמת משקולות 🏋️',
  swimming: 'שחייה 🏊', hybrid: 'היברידי ⚡', mobility: 'מוביליטי 🧘',
}

export default function HistoryPage() {
  const history = useWorkoutStore(s => s.history)

  const completed = history.filter(w => w.status === 'completed')
  const totalMinutes = completed.reduce((acc, w) => acc + (w.actualDurationMinutes || 0), 0)
  const totalVolume = completed.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0)

  // Group by week
  const byWeek = history.reduce<Record<string, typeof history>>((acc, w) => {
    const date = new Date(w.completedAt || w.startedAt || '')
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toLocaleDateString('he-IL')
    if (!acc[key]) acc[key] = []
    acc[key].push(w)
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="היסטוריית אימונים" subtitle={`${completed.length} אימונים הושלמו`} />

      <div className="px-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-teal-950/30 rounded-2xl p-3 text-center">
            <div className="text-xl font-bold text-teal-500">{completed.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">אימונים</div>
          </div>
          <div className="bg-blue-950/30 rounded-2xl p-3 text-center">
            <div className="text-xl font-bold text-blue-400">
              {Math.round(totalMinutes / 60)}h
            </div>
            <div className="text-xs text-gray-400 mt-0.5">שעות</div>
          </div>
          <div className="bg-green-950/30 rounded-2xl p-3 text-center">
            <div className="text-xl font-bold text-green-400">
              {Math.round(totalVolume / 1000)}t
            </div>
            <div className="text-xs text-gray-400 mt-0.5">נפח כולל</div>
          </div>
        </div>

        {/* Weekly frequency chart */}
        {completed.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-1">
              <TrendingUp size={14} />
              תדירות אחרונה
            </h3>
            <WeeklyChart history={completed} />
          </div>
        )}

        {/* History list */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-bold text-gray-300 mb-1">עדיין אין אימונים</h3>
            <p className="text-sm text-gray-500">התחל אימון מהתוכנית שלך</p>
          </div>
        ) : (
          Object.entries(byWeek).map(([week, workouts]) => (
            <div key={week}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                שבוע של {week}
              </h3>
              <div className="space-y-2">
                {workouts.map(w => (
                  <div key={w.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-white text-sm">{w.title}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {TYPE_LABELS[w.type] || w.type}
                          {w.completedAt && ` · ${new Date(w.completedAt).toLocaleDateString('he-IL')}`}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        w.status === 'completed' ? 'bg-green-400' :
                        w.status === 'skipped' ? 'bg-gray-600' : 'bg-teal-400'
                      }`} />
                    </div>
                    {w.status === 'completed' && (
                      <div className="flex gap-3 mt-3 pt-3 border-t border-gray-700">
                        {w.actualDurationMinutes && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={11} />
                            {w.actualDurationMinutes} דקות
                          </div>
                        )}
                        {w.totalVolumeKg && w.totalVolumeKg > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Dumbbell size={11} />
                            {Math.round(w.totalVolumeKg).toLocaleString()} ק"ג
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function WeeklyChart({ history }: { history: Array<{ completedAt?: string; startedAt?: string }> }) {
  const weeks = 8
  const data = Array.from({ length: weeks }, (_, i) => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() - i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    const count = history.filter(w => {
      const d = new Date(w.completedAt || w.startedAt || '')
      return d >= weekStart && d <= weekEnd
    }).length
    return { count, label: i === 0 ? 'השבוע' : `${i}w` }
  }).reverse()

  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-teal-500 rounded-t"
            style={{ height: `${(d.count / max) * 48}px`, minHeight: d.count > 0 ? '4px' : '2px', opacity: d.count > 0 ? 1 : 0.2 }}
          />
          <span className="text-xs text-gray-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
