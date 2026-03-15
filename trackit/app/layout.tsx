import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import './globals.css'
import SessionHydrator from '@/frontend/components/SessionHydrator'

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['400', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Trackit',
  description: 'AI Academic Planner + Mock Self-Service Registration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={caveat.variable}>
      <body>
        <SessionHydrator />
        {children}
      </body>
    </html>
  )
}
