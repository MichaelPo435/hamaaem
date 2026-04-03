'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePlanStore } from '@/lib/store/planStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, Play, ChevronLeft } from 'lucide-react'

const HEB_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']
const HEB_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const TYPE_LABELS: Record<string, string> = {
  running: 'ריצה',
  crossfit: 'קרוספיט',
  weightlifting: 'הרמת משקולות',
  swimming: 'שחייה',
  hybrid: 'היברידי',
  mobility: 'מוביליטי',
}

export default function PlanPage() {
  const activePlan = usePlanStore(s => s.activePlan)
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  if (!activePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-white mb-2">אין תוכנית פעילה</h2>
        <p className="text-gray-400 text-sm mb-6">בנה תוכנית אימון משלך עם התרגילים שאתה בוחר</p>
        <Link
          href="/plan/create"
          className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-2xl font-bold"
        >
          <Plus size={18} />
          בנה תוכנית חדשה
        </Link>
      </div>
    )
  }

  const week = activePlan.weeks[selectedWeek]
  const selectedDayData = selectedDay !== null ? week?.days.find(d => d.dayOfWeek === selectedDay) : null

  return (
    <div>
      <PageHeader
        title={activePlan.title}
        subtitle={`${activePlan.durationWeeks} שבועות · ${TYPE_LABELS[activePlan.type] || activePlan.type}`}
        action={
          <Link href="/plan/create" className="p-2 rounded-xl bg-orange-950/40">
            <Plus size={18} className="text-orange-500" />
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        {/* Week selector */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">בחר שבוע</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {activePlan.weeks.map((w, i) => (
              <button
                key={i}
                onClick={() => { setSelectedWeek(i); setSelectedDay(null) }}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedWeek === i
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                שבוע {w.weekNumber}
              </button>
            ))}
          </div>
          {week?.theme && (
            <p className="text-sm text-orange-500 font-medium mt-2">{week.theme}</p>
          )}
        </div>

        {/* Weekly grid */}
        {week && (
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">לוח שבועי</h3>
            <div className="grid grid-cols-7 gap-1">
              {HEB_DAYS.map((d, i) => {
                const dayData = week.days.find(day => day.dayOfWeek === i)
                const isRest = !dayData || dayData.isRestDay
                const isSelected = selectedDay === i
                const today = new Date().getDay() === i

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : i)}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : today
                        ? 'bg-gray-800 border-2 border-orange-500'
                        : 'bg-gray-800'
                    }`}
                  >
                    <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>{d}</span>
                    <span className="text-lg mt-1">{isRest ? '😴' : '💪'}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Selected day detail */}
        {selectedDayData && !selectedDayData.isRestDay && selectedDayData.session && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">{selectedDayData.session.title}</h3>
                <p className="text-sm text-gray-400">
                  יום {HEB_DAYS_FULL[selectedDayData.dayOfWeek]} · {selectedDayData.session.estimatedDurationMinutes} דקות
                </p>
              </div>
              <Link
                href={`/workout/${selectedDayData.session.id}`}
                className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                <Play size={14} fill="currentColor" />
                התחל
              </Link>
            </div>

            {/* Blocks */}
            {selectedDayData.session.blocks.map(block => (
              <div key={block.id} className="mb-3 last:mb-0">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{block.title}</h4>
                <div className="space-y-1">
                  {block.exercises.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-gray-700 rounded-lg">
                      <Link
                        href={`/library/${ex.exerciseSlug}`}
                        className="font-medium text-sm text-gray-200 flex items-center gap-1 hover:text-orange-400"
                      >
                        {ex.nameHe}
                        <ChevronLeft size={12} className="text-gray-600" />
                      </Link>
                      <span className="text-xs text-gray-400">
                        {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ''}
                        {ex.durationSeconds ? `${ex.durationSeconds}s` : ''}
                        {ex.distanceMeters ? `${ex.distanceMeters}m` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedDayData?.isRestDay && (
          <div className="bg-blue-950/30 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">😴</div>
            <div className="font-bold text-gray-200">יום מנוחה</div>
            <div className="text-sm text-gray-400 mt-1">המנוחה חלק חשוב מהתוכנית</div>
          </div>
        )}

        {/* Plan description */}
        <div className="bg-orange-950/20 rounded-2xl p-4">
          <p className="text-sm text-gray-300">{activePlan.description}</p>
        </div>
      </div>
    </div>
  )
}
