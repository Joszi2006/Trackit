'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStore } from '@/frontend/store'

interface TopNavProps {
  studentName: string
  program: string
  currentSemester: number
}

export default function TopNav({ studentName, program, currentSemester }: TopNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const clearSession = useStore(s => s.clearSession)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearSession()
    router.push('/login')
  }

  const navLinks = [
    { href: '/dashboard',      label: 'Dashboard' },
    { href: '/roadmap',        label: 'My Path'   },
    { href: '/plan/fall-2025', label: 'Plan'      },
  ]

  return (
    <nav className="w-full bg-[var(--color-card)] border-b-2 border-[var(--color-ink)] px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">

        {/* Logo */}
        <span className="font-display text-2xl font-bold text-[var(--color-ink)] tracking-wide">
          🎓 Trackit
        </span>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href.split('/').slice(0, 2).join('/'))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium pb-0.5 transition-colors ${
                  isActive
                    ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-ink)]'
                    : 'text-[var(--color-ink-light)] hover:text-[var(--color-ink)]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Student info + logout */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-ink-light)]">
            {studentName} · {program} · S{currentSemester}
          </span>
          <button
            onClick={handleLogout}
            className="text-[var(--color-ink-light)] hover:text-[var(--color-ink)] underline"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  )
}
