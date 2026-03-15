'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/frontend/store'
import Button from '@/frontend/components/Button'
import Badge from '@/frontend/components/Badge'
import SketchCard from '@/frontend/components/SketchCard'
import CareerGoalMarker from '@/frontend/components/CareerGoalMarker'

export default function OnboardingPage() {
  const router    = useRouter()
  const studentId = useStore(s => s.studentId)

  const [step, setStep]       = useState<1 | 2>(1)
  const [goal, setGoal]       = useState('')
  const [tags, setTags]       = useState<string[]>([])
  const [parsing, setParsing] = useState(false)

  async function parseGoal() {
    if (!goal.trim() || !studentId) return
    setParsing(true)
    try {
      const res  = await fetch(`/api/student/${studentId}/career`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ goal }),
      })
      const data = await res.json() as { careerTags?: string[] }
      setTags(data.careerTags ?? [])
      setStep(2)
    } finally {
      setParsing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <p className="font-display text-3xl font-bold text-center mb-6">🎓 Trackit</p>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {([1, 2] as const).map(n => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full border-2 border-[var(--color-ink)] flex items-center justify-center text-xs font-bold transition-colors ${
                step === n ? 'bg-[var(--color-ink)] text-white'
                : step > n  ? 'bg-[var(--color-done)] text-white border-[var(--color-done)]'
                : 'bg-white'
              }`}>{step > n ? '✓' : n}</div>
              {n < 2 && <div className="w-12 h-0.5 bg-[var(--color-rule)]" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <SketchCard>
            <p className="font-display text-2xl font-semibold mb-2">What&apos;s your career goal?</p>
            <p className="text-sm text-[var(--color-ink-light)] mb-4">
              We&apos;ll use this to prioritize courses that move you toward your goal.
            </p>
            <textarea rows={3} value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="I want to become a machine learning engineer…"
              className="w-full px-3 py-2 text-sm border-2 border-[var(--color-ink)] rounded-md bg-white focus:outline-none resize-none"
            />
            <Button loading={parsing} disabled={!goal.trim()} onClick={parseGoal} className="w-full mt-4">
              Parse my goal →
            </Button>
          </SketchCard>
        )}

        {step === 2 && (
          <SketchCard>
            <div className="flex justify-center mb-4">
              <svg width={100} height={100} viewBox="0 0 100 100">
                <CareerGoalMarker careerTags={tags} x={50} y={50} size={1} />
              </svg>
            </div>
            <p className="font-display text-2xl font-semibold text-center mb-1">You&apos;re all set!</p>
            <p className="text-sm text-[var(--color-ink-light)] text-center mb-4">Career tags identified:</p>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {tags.map(tag => <Badge key={tag} status="enrolled" label={tag} />)}
            </div>
            <Button onClick={() => router.push('/dashboard')} className="w-full">Go to my plan →</Button>
          </SketchCard>
        )}

      </div>
    </div>
  )
}
