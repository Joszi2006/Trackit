'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/frontend/store'
import { useStudent } from '@/frontend/hooks/useStudent'
import TopNav      from '@/frontend/components/TopNav'
import SketchCard  from '@/frontend/components/SketchCard'
import Badge       from '@/frontend/components/Badge'
import Button      from '@/frontend/components/Button'
import CourseChip  from '@/frontend/components/CourseChip'
import RoadMap, { type SemesterStop } from '@/frontend/components/RoadMap'
import { semesterLabel, semNumToSlug } from '@/frontend/utils/semester'
import type { Course } from '@/shared/types'

type ChipStatus = 'completed' | 'enrolled' | 'planned' | 'failed' | 'delayed'

function semesterTerm(n: number): 'Fall' | 'Winter' {
  return n % 2 === 1 ? 'Fall' : 'Winter'
}

export default function RoadmapPage() {
  const router       = useRouter()
  const studentId    = useStore(s => s.studentId)
  const sessionReady = useStore(s => s.sessionReady)
  const { data, isLoading, error } = useStudent()

  const [selectedSemNum, setSelectedSemNum] = useState<number | null>(null)

  useEffect(() => {
    if (sessionReady && !studentId) router.push('/login')
  }, [sessionReady, studentId, router])

  if (!sessionReady || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <p className="font-display text-2xl text-[var(--color-ink-light)]">Loading your journey…</p>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <p className="text-[var(--color-failed)]">{error ?? 'Could not load data'}</p>
    </div>
  )

  const { student, program, courses, enrollments } = data
  const courseMap    = new Map<string, Course>(courses.map(c => [c.id, c]))
  const completedSet = new Set(student.completedCourseIds)
  const failedSet    = new Set(student.failedCourseIds)

  const semesters: SemesterStop[] = Array.from({ length: 8 }, (_, i) => {
    const semNum    = i + 1
    const isPast    = semNum < student.currentSemester
    const isCurrent = semNum === student.currentSemester
    const semYear   = Math.ceil(semNum / 2)
    const term      = semesterTerm(semNum)

    if (isPast) {
      const chips = courses
        .filter(c => c.year === semYear && c.semestersOffered.includes(term) &&
          (completedSet.has(c.id) || failedSet.has(c.id)))
        .slice(0, 5)
        .map(c => ({
          code:   c.code.split(' ').slice(-1)[0],
          status: (failedSet.has(c.id) ? 'failed' : 'completed') as ChipStatus,
        }))
      return { semNum, chips }
    }

    if (isCurrent) {
      const enrolled = enrollments.filter(e => e.status === 'enrolled')
      const chips = [
        ...enrolled.map(e => ({
          code:   e.section.course.code.split(' ').slice(-1)[0],
          status: 'enrolled' as ChipStatus,
        })),
        ...student.failedCourseIds
          .map(id => courseMap.get(id))
          .filter((c): c is Course => c !== undefined)
          .slice(0, 2)
          .map(c => ({ code: c.code.split(' ').slice(-1)[0], status: 'failed' as ChipStatus })),
      ].slice(0, 5)
      return { semNum, chips }
    }

    return { semNum, chips: [] }
  })

  const selectedStop  = selectedSemNum !== null ? semesters.find(s => s.semNum === selectedSemNum) : null
  const isPastSem     = selectedSemNum !== null && selectedSemNum < student.currentSemester
  const isCurrentSem  = selectedSemNum === student.currentSemester
  const isFutureSem   = selectedSemNum !== null && selectedSemNum > student.currentSemester

  const detailBadgeStatus = isPastSem ? 'completed' : isCurrentSem ? 'enrolled' : 'planned'
  const planSlug = selectedSemNum !== null ? semNumToSlug(selectedSemNum, student.startYear) : ''

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <TopNav studentName={student.name} program={program.name} currentSemester={student.currentSemester} />

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl font-bold text-[var(--color-ink)]">Your 4-Year Journey</h1>
          <p className="text-[var(--color-ink-light)] mt-1">
            {program.name} · {semesterLabel(student.currentSemester)}
          </p>
        </div>

        {/* Two-column on lg+, stacked on mobile */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-8 lg:items-start mb-8">

          {/* Left — RoadMap */}
          <div>
            <RoadMap
              semesters={semesters}
              currentSemester={student.currentSemester}
              careerTags={student.careerTags}
              onSemesterClick={setSelectedSemNum}
              selectedSemNum={selectedSemNum ?? undefined}
            />
          </div>

          {/* Right — detail panel */}
          <div className="mt-6 lg:mt-0 lg:sticky lg:top-8">
            {selectedSemNum !== null && selectedStop ? (
              <SketchCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-display text-xl font-semibold text-[var(--color-ink)]">
                      {semesterLabel(selectedSemNum)}
                    </p>
                    <p className="text-sm text-[var(--color-ink-light)] mt-0.5 capitalize">
                      {planSlug.replace('-', ' ')}
                    </p>
                  </div>
                  <Badge status={detailBadgeStatus} />
                </div>

                {selectedStop.chips.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {selectedStop.chips.map((chip, i) => (
                      <CourseChip key={i} code={chip.code} status={chip.status} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-ink-light)] mb-5">
                    No courses recorded for this semester yet.
                  </p>
                )}

                <Link href={`/plan/${planSlug}`}>
                  <Button variant={isCurrentSem ? 'primary' : 'outline'}>
                    {isPastSem ? 'View Plan' : isCurrentSem ? 'Open Planner →' : 'Preview Semester'}
                  </Button>
                </Link>
              </SketchCard>
            ) : (
              <p className="hidden lg:block text-sm text-[var(--color-ink-light)] pt-4">
                Click any semester on the map to see details.
              </p>
            )}
          </div>
        </div>

        {/* Mobile-only hint */}
        {selectedSemNum === null && (
          <p className="text-center text-sm text-[var(--color-ink-light)] lg:hidden">
            Click any semester on the map to see details.
          </p>
        )}

      </main>
    </div>
  )
}
