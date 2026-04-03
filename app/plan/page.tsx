'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePlanStore } from '@/lib/store/planStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Plus, Play, ChevronLeft, Pencil } from 'lucide-react'

const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

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
          className="inline-flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-2xl font-bold"
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
          <div className="flex gap-2">
            <Link href="/plan/edit" className="p-2 rounded-xl bg-gray-800">
              <Pencil size={18} className="text-gray-400" />
            </Link>
            <Link href="/plan/create" className="p-2 rounded-xl bg-teal-950/40">
              <Plus size={18} className="text-teal-500" />
            </Link>
          </div>
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
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                שבוע {w.weekNumber}
              </button>
            ))}
          </div>
          {week?.theme && (
            <p className="text-sm text-teal-500 font-medium mt-2">{week.theme}</p>
          )}
        </div>

        {/* Weekly list */}
        {week && (
          <div className="space-y-2">
            {HEB_DAYS.map((d, i) => {
              const dayData = week.days.find(day => day.dayOfWeek === i)
              const isRest = !dayData || dayData.isRestDay
              const isSelected = selectedDay === i
              const today = new Date().getDay() === i

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : i)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white'
                      : today
                      ? 'bg-gray-800 border-2 border-teal-500'
                      : 'bg-gray-800'
                  }`}
                >
                  <span className={`font-semibold text-sm ${isSelected ? 'text-white' : today ? 'text-teal-400' : 'text-gray-200'}`}>
                    יום {d}
                  </span>
                  <div className="flex items-center gap-2">
                    {!isRest && dayData?.session && (
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        {dayData.session.title}
                      </span>
                    )}
                    <span className="text-base">{isRest ? '😴' : '💪'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Selected day detail */}
        {selectedDayData && !selectedDayData.isRestDay && selectedDayData.session && (
          <div className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white">{selectedDayData.session.title}</h3>
                <p className="text-sm text-gray-400">
                  יום {HEB_DAYS[selectedDayData.dayOfWeek]} · {selectedDayData.session.estimatedDurationMinutes} דקות
                </p>
              </div>
              <Link
                href={`/workout/${selectedDayData.session.id}`}
                className="flex items-center gap-1 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
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
                        className="font-medium text-sm text-gray-200 flex items-center gap-1 hover:text-teal-400"
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
        <div className="bg-teal-950/20 rounded-2xl p-4">
          <p className="text-sm text-gray-300">{activePlan.description}</p>
        </div>
      </div>
    </div>
  )
}
