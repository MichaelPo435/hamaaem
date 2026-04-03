import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Hebrew } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'המאמן - אפליקציית כושר אישית',
  description: 'תוכניות אימון מותאמות אישית, מעקב אימונים, ספריית תרגילים',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'המאמן',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f97316',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={notoSansHebrew.variable}>
      <body className="font-[var(--font-noto)] bg-gray-950 min-h-screen antialiased">
        <main className="pb-24 max-w-lg mx-auto min-h-screen bg-gray-900 shadow-sm">
          {children}
        </main>
        <div className="max-w-lg mx-auto">
          <BottomNav />
        </div>
      </body>
    </html>
  )
}
