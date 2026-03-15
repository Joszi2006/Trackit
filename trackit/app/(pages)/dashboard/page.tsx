'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/frontend/store'
import { useStudent }  from '@/frontend/hooks/useStudent'
import TopNav          from '@/frontend/components/TopNav'
import ProgressBar     from '@/frontend/components/ProgressBar'
import Badge           from '@/frontend/components/Badge'
import Button          from '@/frontend/components/Button'
import SketchCard      from '@/frontend/components/SketchCard'
import { semesterLabel } from '@/frontend/utils/semester'
import type { Course } from '@/shared/types'

const STANDING_LABEL: Record<string, string> = {
  good:      'Good Standing',
  probation: 'Academic Probation',
}

export default function DashboardPage() {
  const router        = useRouter()
  const studentId     = useStore(s => s.studentId)
  const sessionReady  = useStore(s => s.sessionReady)
  const { data, isLoading, error } = useStudent()

  useEffect(() => {
    if (sessionReady && !studentId) router.push('/login')
  }, [sessionReady, studentId, router])

  if (!sessionReady || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <p className="font-display text-2xl text-[var(--color-ink-light)]">Loading your plan…</p>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <p className="text-[var(--color-failed)]">{error ?? 'Could not load data'}</p>
    </div>
  )

  const { student, program, courses, window: regWindow } = data
  const completedSet = new Set(student.completedCourseIds)

  const creditsCompleted = courses
    .filter((c: Course) => completedSet.has(c.id))
    .reduce((sum: number, c: Course) => sum + c.credits, 0)

  const completedSemesters = Math.max(0, student.currentSemester - 1)

  const homeFaculty  = program.faculty
  const distFaculties = ['Science', 'Social Sciences', 'Humanities', 'Arts & Letters']
    .filter(f => f !== homeFaculty)

  const distProgress = distFaculties.map(fac => ({
    faculty: fac,
    filled:  Math.min(courses.filter((c: Course) => completedSet.has(c.id) && c.faculty === fac).length, 2),
  }))

  const currentSemLabel = semesterLabel(student.currentSemester)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopNav studentName={student.name} program={program.name} currentSemester={student.currentSemester} />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl font-bold text-[var(--color-ink)]">
            Hey, {student.name.split(' ')[0]} 👋
          </h1>
          <p className="text-[var(--color-ink-light)] mt-1">{program.name} · {currentSemLabel}</p>
          <div className="mt-3 max-w-sm">
            <ProgressBar label="Graduation progress" current={creditsCompleted} total={program.totalCredits} />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <SketchCard>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-light)] mb-1">Credits Earned</p>
            <p className="font-display text-3xl font-bold text-[var(--color-ink)]">{creditsCompleted}</p>
            <p className="text-sm text-[var(--color-ink-light)]">of {program.totalCredits} completed</p>
          </SketchCard>

          <SketchCard>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-light)] mb-1">Semester</p>
            <p className="font-display text-xl font-bold text-[var(--color-ink)]">{currentSemLabel}</p>
            <p className="text-sm text-[var(--color-ink-light)]">Semester {student.currentSemester} of 8</p>
          </SketchCard>

          <SketchCard>
            <p className="text-xs uppercase tracking-wide text-[var(--color-ink-light)] mb-1">Standing</p>
            <p className={`font-display text-xl font-bold ${
              student.standing === 'good' ? 'text-[var(--color-done)]' : 'text-[var(--color-failed)]'
            }`}>
              {STANDING_LABEL[student.standing] ?? student.standing}
            </p>
          </SketchCard>
        </div>

        {/* Registration window banner */}
        {regWindow?.status === 'open' && (
          <div className="mb-6 border-2 border-[var(--color-done)] bg-[#dcfce7] rounded-lg p-4 flex items-center justify-between"
            style={{ boxShadow: '3px 3px 0 var(--color-done)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-done)]" />
              <span className="text-sm font-medium text-[#15803d]">
                {regWindow.semester} registration is <strong>OPEN</strong>
              </span>
            </div>
            <Link href={`/plan/${regWindow.semester.toLowerCase().replace(' ', '-')}`}>
              <Button variant="outline" className="text-xs py-1">Plan this semester →</Button>
            </Link>
          </div>
        )}

        {/* Path card + Career focus */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <SketchCard>
            <p className="font-display text-lg font-semibold mb-1">Your 4-Year Path</p>
            <p className="text-sm text-[var(--color-ink-light)] mb-4">
              {completedSemesters} of 8 semesters complete
            </p>
            <Link href="/roadmap">
              <Button>View Full Map →</Button>
            </Link>
          </SketchCard>

          {student.careerTags.length > 0 && (
            <SketchCard>
              <p className="font-display text-lg font-semibold mb-3">Career Focus</p>
              <div className="flex flex-wrap gap-2">
                {student.careerTags.map(tag => (
                  <Badge key={tag} status="planned" label={tag} />
                ))}
              </div>
            </SketchCard>
          )}
        </div>

        {/* Distribution requirements — full width, 2-col grid */}
        <SketchCard>
          <p className="font-display text-lg font-semibold mb-3">Distribution Requirements</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {distProgress.map(d => (
              <ProgressBar key={d.faculty} label={d.faculty} current={d.filled} total={2} />
            ))}
          </div>
        </SketchCard>

      </main>
    </div>
  )
}
