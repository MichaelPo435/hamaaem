'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, BookOpen, Waves, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkoutStore } from '@/lib/store/workoutStore'

const tabs = [
  { href: '/dashboard', label: 'בית', icon: Home },
  { href: '/plan', label: 'תוכנית', icon: Dumbbell },
  { href: '/library', label: 'ספריה', icon: BookOpen },
  { href: '/mobility', label: 'מוביליטי', icon: Waves },
  { href: '/profile', label: 'פרופיל', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()
  const activeSession = useWorkoutStore(s => s.activeSession)

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-gray-900 border-t border-gray-800 z-50 safe-area-pb">
      {activeSession && (
        <Link
          href={`/workout/${activeSession.id}`}
          className="block bg-orange-500 text-white text-center py-2 text-sm font-medium"
        >
          אימון פעיל: {activeSession.title} ← המשך
        </Link>
      )}
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors',
                active ? 'text-orange-500' : 'text-gray-500'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
