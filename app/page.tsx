'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/userStore'

export default function RootPage() {
  const router = useRouter()
  const user = useUserStore(s => s.user)

  useEffect(() => {
    if (!user || !user.onboardingCompleted) {
      router.replace('/onboarding')
    } else {
      router.replace('/dashboard')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl font-bold text-orange-500 mb-2">💪</div>
        <p className="text-gray-500">טוען...</p>
      </div>
    </div>
  )
}
