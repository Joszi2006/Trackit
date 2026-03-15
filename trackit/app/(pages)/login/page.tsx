'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/frontend/store'
import Button from '@/frontend/components/Button'
import SketchCard from '@/frontend/components/SketchCard'

export default function LoginPage() {
  const router    = useRouter()
  const setStudentId = useStore(s => s.setStudentId)

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json() as { studentId?: string; hasCareerGoal?: boolean; message?: string }

      if (!res.ok) { setError(data.message ?? 'Login failed'); return }

      setStudentId(data.studentId!)
      router.push(data.hasCareerGoal ? '/dashboard' : '/onboarding')
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    w-full px-3 py-2 text-sm border-2 border-[var(--color-ink)] rounded-md
    bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]
    transition-shadow
  `

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-display text-5xl font-bold text-[var(--color-ink)]">🎓 Trackit</p>
          <p className="text-[var(--color-ink-light)] mt-1 text-sm">MtA Academic Planner</p>
        </div>

        <SketchCard>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-light)] uppercase tracking-wide mb-1">
                Student Email
              </label>
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="alex.johnson@mta.ca"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-light)] uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                type="password" required autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="any password"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-failed)]">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1">
              Sign in →
            </Button>
          </form>
        </SketchCard>

        <p className="text-center text-xs text-[var(--color-ink-light)] mt-4">
          Sign in with your MtA student email and password.
          First time? Your account is created automatically.
        </p>
      </div>
    </div>
  )
}
