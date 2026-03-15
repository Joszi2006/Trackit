// Stage 3 — Interval Scheduling + Scoring
// Pure function: no Prisma, no HTTP.
// CSP backtracking with forward checking + pre-computed conflict map.
import type { CourseNode, Section, ScheduleResult } from '@/shared/types'

const BUFFER_MINUTES = 10
const MAX_RESULTS    = 3
const MAX_COURSES    = 5   // hard cap per semester

type Bundle    = { course: CourseNode; sections: Section[]; required: boolean }
type ConflictMap = Map<string, Set<string>>   // sectionId → conflicting sectionIds
type Domains   = Section[][]                  // one domain per bundle

// ─────────────────────────────────────────────
// Exported — Stage 3 entry point
// ─────────────────────────────────────────────

/**
 * Generates up to 3 conflict-free schedule options, ranked by score.
 * Uses a pre-computed conflict map + forward checking to prune dead branches early.
 */
export function generateSchedules(
  bundles: Bundle[],
  existingEnrollments: Section[],
): ScheduleResult {
  const allSections    = bundles.flatMap(b => b.sections)
  const conflictMap    = buildConflictMap([...allSections, ...existingEnrollments])
  const fixedConflicts = new Set(
    existingEnrollments.flatMap(e =>
      allSections.filter(s => sectionsOverlap(s, e)).map(s => s.id)
    )
  )

  // Initial domains: strip sections that already conflict with existing enrollments
  const domains: Domains = bundles.map(b =>
    b.sections.filter(s => !fixedConflicts.has(s.id))
  )

  // Fail fast: required bundle already empty before search starts
  for (let i = 0; i < bundles.length; i++) {
    if (domains[i].length === 0 && bundles[i].required) {
      return {
        schedules: [], canRegister: false, canPreview: true,
        message: 'A required course conflicts with your existing schedule.',
        suggestions: buildSuggestions(bundles),
      }
    }
  }

  const results: Section[][] = []
  backtrack(bundles, conflictMap, 0, [], domains, results)

  if (results.length === 0) {
    return {
      schedules: [], canRegister: false, canPreview: true,
      message: 'No conflict-free schedule found with current course selection.',
      suggestions: buildSuggestions(bundles),
    }
  }

  const ranked = results
    .map(schedule => ({ schedule, score: scoreSchedule(schedule, bundles) }))
    .sort((a, b) => b.score - a.score)
    .map(r => r.schedule)

  return { schedules: ranked, canRegister: true, canPreview: true }
}

/**
 * Additive score for a schedule.
 * Required courses (12pts) > distribution courses (6pts) > career tag overlap.
 */
export function scoreSchedule(sections: Section[], bundles: Bundle[]): number {
  const requiredIds     = new Set(bundles.filter(b => b.required).map(b => b.course.course.id))
  const distributionIds = new Set(bundles.filter(b => !b.required).map(b => b.course.course.id))

  return sections.reduce((score, section) => {
    if (requiredIds.has(section.courseId))     return score + 12
    if (distributionIds.has(section.courseId)) return score + 6
    const bundle = bundles.find(b => b.course.course.id === section.courseId)
    return score + (bundle?.course.careerScore ?? 0)
  }, 0)
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Pre-computes which sections conflict with each other.
 * O(n²) once → O(1) per conflict check during backtracking.
 */
function buildConflictMap(sections: Section[]): ConflictMap {
  const map = new Map<string, Set<string>>()
  for (const a of sections) {
    const conflicts = new Set<string>()
    for (const b of sections) {
      if (a.id !== b.id && sectionsOverlap(a, b)) conflicts.add(b.id)
    }
    map.set(a.id, conflicts)
  }
  return map
}

/**
 * Forward checking: after placing `placed`, filter remaining domains.
 * Returns null if any required bundle's domain becomes empty (dead branch).
 */
function propagate(
  domains: Domains,
  placed: Section,
  conflictMap: ConflictMap,
  fromIndex: number,
  bundles: Bundle[],
): Domains | null {
  const conflicts = conflictMap.get(placed.id) ?? new Set<string>()
  const next = domains.map((d, i) =>
    i < fromIndex ? d : d.filter(s => !conflicts.has(s.id))
  )
  for (let i = fromIndex; i < next.length; i++) {
    if (next[i].length === 0 && bundles[i].required) return null
  }
  return next
}

function backtrack(
  bundles: Bundle[],
  conflictMap: ConflictMap,
  index: number,
  chosen: Section[],
  domains: Domains,
  results: Section[][],
): void {
  if (results.length >= MAX_RESULTS) return
  if (chosen.length >= MAX_COURSES || index >= bundles.length) {
    if (chosen.length > 0) results.push([...chosen])
    return
  }

  for (const section of domains[index]) {
    const next = propagate(domains, section, conflictMap, index + 1, bundles)
    if (next === null) continue   // forward check: required bundle went empty
    chosen.push(section)
    backtrack(bundles, conflictMap, index + 1, chosen, next, results)
    chosen.pop()
  }

  if (!bundles[index].required) {
    backtrack(bundles, conflictMap, index + 1, chosen, domains, results)
  }
}

function sectionsOverlap(a: Section, b: Section): boolean {
  const sharedDay = a.days.some(d => b.days.includes(d))
  if (!sharedDay) return false

  const aStart = toMinutes(a.startTime)
  const aEnd   = toMinutes(a.endTime) + BUFFER_MINUTES
  const bStart = toMinutes(b.startTime)
  const bEnd   = toMinutes(b.endTime) + BUFFER_MINUTES

  return aStart < bEnd && bStart < aEnd
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function buildSuggestions(bundles: Bundle[]): string[] {
  const suggestions: string[] = []
  const noSections = bundles
    .filter(b => b.required && b.sections.length === 0)
    .map(b => b.course.course.code)
  if (noSections.length > 0) {
    suggestions.push(`No sections available for required courses: ${noSections.join(', ')}`)
  }
  suggestions.push('Try removing an elective to reduce scheduling conflicts.')
  return suggestions
}
