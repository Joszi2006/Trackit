'use client'

import { useEffect, useState, Fragment } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStore } from '@/frontend/store'
import { usePlan }  from '@/frontend/hooks/usePlan'
import { useRegistration } from '@/frontend/hooks/useRegistration'
import TopNav     from '@/frontend/components/TopNav'
import SketchCard from '@/frontend/components/SketchCard'
import Badge      from '@/frontend/components/Badge'
import Button     from '@/frontend/components/Button'
import { useStudent } from '@/frontend/hooks/useStudent'
import type { Section, CoreqWarning } from '@/shared/types'

// fall-2026 → winter-2027. Returns null for winter (next Fall is a new session).
function nextSessionSlug(slug: string): string | null {
  const [term, year] = slug.split('-')
  if (term !== 'fall') return null
  return `winter-${parseInt(year, 10) + 1}`
}

function hasFullSections(schedule: Section[]): boolean {
  return schedule.some(s => s.enrolledCount >= s.totalSeats)
}

function CoreqWarningBanner({ warnings }: { warnings: CoreqWarning[] }) {
  if (warnings.length === 0) return null
  return (
    <div className="mb-4 p-4 border-2 border-[var(--color-delayed)] rounded-lg bg-[#fef3c7]">
      <p className="text-sm font-semibold text-[#92400e]">Co-registration required</p>
      {warnings.map((w, i) => (
        <p key={i} className="text-xs text-[#92400e] mt-1">
          · {w.courseCode} requires co-registration with {w.missingCoreqCode}
        </p>
      ))}
    </div>
  )
}

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8–18

const COURSE_COLORS = ['#bfdbfe', '#bbf7d0', '#fef3c7', '#fce7f3', '#e9d5ff']

function WeeklyGrid({ sections, codeMap }: { sections: Section[]; codeMap: Map<string, string> }) {
  const courseIds = [...new Set(sections.map(s => s.courseId))]
  const colorMap  = new Map(courseIds.map((id, i) => [id, COURSE_COLORS[i % COURSE_COLORS.length]]))

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[340px]" style={{ gridTemplateColumns: '40px repeat(5, 1fr)' }}>
        {/* Header */}
        <div />
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[var(--color-ink-light)] py-1 border-b border-[var(--color-rule)]">{d}</div>
        ))}

        {/* Time rows */}
        {HOURS.map(hour => (
          <Fragment key={hour}>
            <div className="text-[9px] text-[var(--color-ink-light)] pr-1 text-right pt-0.5">{hour}:00</div>
            {DAYS.map(day => {
              const sec = sections.find(s => s.days.includes(day) && Number(s.startTime.split(':')[0]) === hour)
              const code = sec ? (codeMap.get(sec.courseId) ?? '').split(' ').pop() : ''
              return (
                <div key={`${hour}-${day}`}
                  className="border-b border-l border-[var(--color-rule)] h-6 text-[9px]"
                  style={{ backgroundColor: sec ? colorMap.get(sec.courseId) : undefined }}
                >
                  {sec && <span className="truncate px-0.5 font-mono leading-tight">{code}</span>}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default function PlanPage() {
  const router    = useRouter()
  const params    = useParams<{ semester: string }>()
  const studentId    = useStore(s => s.studentId)
  const sessionReady = useStore(s => s.sessionReady)
  const { data: studentData } = useStudent()
  const { result, isLoading, error: planError, generate, advice, isAdvising, advise } = usePlan()
  const { results: regResults, isSubmitting, submit } = useRegistration()

  const [selected, setSelected]             = useState<number | null>(null)
  const [preferWaitlist, setPreferWaitlist] = useState(false)

  useEffect(() => { setPreferWaitlist(false) }, [selected])

  const semesterStr = params.semester
  // Convert "fall-2025" → "Fall 2025"
  const semesterDisplay = semesterStr.replace(/-(\d{4})$/, ' $1').replace(/^(\w)/, c => c.toUpperCase())

  useEffect(() => {
    if (!sessionReady) return
    if (!studentId) { router.push('/login'); return }
    generate(semesterDisplay)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady, studentId])

  async function confirmRegistration() {
    if (selected === null || !result) return
    const sectionIds = result.schedules[selected].map(s => s.id)
    await submit(sectionIds, preferWaitlist)
  }

  const student  = studentData?.student
  const program  = studentData?.program
  const codeMap  = new Map((studentData?.courses ?? []).map(c => [c.id, c.code]))
  const nameMap  = new Map((studentData?.courses ?? []).map(c => [c.id, c.name]))
  const nextSlug = nextSessionSlug(semesterStr)

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {student && program && (
        <TopNav studentName={student.name} program={program.name} currentSemester={student.currentSemester} />
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-3xl font-bold">{semesterDisplay} Plan</h1>
          {result && (
            <Badge status={result.canRegister ? 'open' : 'preview'} />
          )}
        </div>

        {isLoading && (
          <p className="font-display text-xl text-[var(--color-ink-light)]">Running the scheduling engine…</p>
        )}

        {planError && <p className="text-[var(--color-failed)]">{planError}</p>}

        {/* Registration results screen */}
        {regResults && (
          <SketchCard className="max-w-lg">
            <p className="font-display text-2xl font-semibold mb-4">Registration complete</p>
            <div className="flex flex-col gap-2 mb-6">
              {regResults.results.map(r => (
                <div key={r.sectionId} className="flex justify-between items-center text-sm">
                  <span className="font-mono">{r.courseCode}</span>
                  <Badge status={r.status === 'enrolled' ? 'enrolled' : r.status === 'waitlisted' ? 'delayed' : 'failed'}
                    label={r.status} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => router.push('/dashboard')}>← Back to Dashboard</Button>
              {nextSlug && (
                <Button variant="outline" onClick={() => router.push(`/plan/${nextSlug}`)}>
                  Plan {nextSlug.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())} →
                </Button>
              )}
            </div>
          </SketchCard>
        )}

        {/* Schedule options */}
        {!regResults && result && (
          <>
            {!result.canRegister && result.message && (
              <div className="mb-4 p-4 border-2 border-[var(--color-delayed)] rounded-lg bg-[#fef3c7]">
                <p className="text-sm font-medium text-[#92400e]">{result.message}</p>
                {result.suggestions?.map((s, i) => (
                  <p key={i} className="text-xs text-[#92400e] mt-1">· {s}</p>
                ))}
              </div>
            )}

            <CoreqWarningBanner warnings={result.coreqWarnings ?? []} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              {result.schedules.map((schedule, i) => (
                <div key={i} onClick={() => { setSelected(i); advise(schedule) }} className="cursor-pointer">
                <SketchCard accent={selected === i}
                  className={`transition-all ${selected === i ? 'ring-2 ring-[var(--color-active)]' : ''}`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-display text-lg font-semibold">Option {i + 1}</p>
                    {selected === i && <Badge status="enrolled" label="Selected" />}
                  </div>

                  <WeeklyGrid sections={schedule} codeMap={codeMap} />

                  <div className="mt-3 flex flex-col gap-1">
                    {schedule.map(s => (
                      <div key={s.id} className="flex flex-col text-xs lg:flex-row lg:gap-2">
                        <span className="font-mono font-medium text-[var(--color-ink)]">
                          {codeMap.get(s.courseId) ?? s.courseId}
                          <span className="lg:hidden font-normal text-[var(--color-ink-light)]"> · {nameMap.get(s.courseId) ?? ''}</span>
                        </span>
                        <span className="text-[var(--color-ink-light)]">{s.days.join('/')} {s.startTime}–{s.endTime}</span>
                      </div>
                    ))}
                  </div>

                  {/* AI Insight — shown inline under the selected schedule */}
                  {selected === i && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-rule)]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-light)] mb-1">AI Insight</p>
                      {isAdvising && <p className="text-xs text-[var(--color-ink-light)] animate-pulse">Generating advice…</p>}
                      {!isAdvising && advice && <p className="text-xs leading-relaxed">{advice}</p>}
                    </div>
                  )}
                </SketchCard>
                </div>
              ))}
            </div>

            {/* Sticky confirm footer */}
            {selected !== null && result.canRegister && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[var(--color-ink)] p-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-[var(--color-ink-light)]">
                      {result.schedules[selected].length} sections selected
                    </p>
                    {hasFullSections(result.schedules[selected]) && (
                      <label className="flex items-center gap-2 text-sm cursor-pointer text-[var(--color-ink)]">
                        <input
                          type="checkbox"
                          checked={preferWaitlist}
                          onChange={e => setPreferWaitlist(e.target.checked)}
                          className="accent-[var(--color-active)]"
                        />
                        Waitlist full sections instead of skipping them
                      </label>
                    )}
                  </div>
                  <Button loading={isSubmitting} onClick={confirmRegistration}>
                    Confirm &amp; Register All →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

