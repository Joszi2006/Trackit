// Stage 2 — Distribution Requirement Selector (greedy set cover)
// Pure function: no Prisma, no HTTP.
// Fills non-home-faculty distribution slots respecting 2-per-prefix cap.
import type { Course, CourseNode, DistributionResult, DistributionState } from '@/shared/types'

const SLOTS_REQUIRED = 2   // courses needed per non-home faculty category
const PREFIX_CAP     = 2   // max courses from the same subject prefix per category

const ALL_FACULTIES = ['Science', 'Social Sciences', 'Humanities', 'Arts & Letters'] as const

// ─────────────────────────────────────────────
// Exported — Stage 2 entry point
// ─────────────────────────────────────────────

/**
 * Greedy walk over orderedCourses (depth ASC, careerScore DESC from Stage 1).
 * Assigns each course to a distribution slot when eligible.
 * Completed courses are pre-applied so already-met requirements aren't double-counted.
 */
export function selectDistributionCourses(
  orderedCourses: CourseNode[],
  studentFaculty: string,
  distributionChoices: Record<string, string>,
  completedIds: string[],
  completedCourses: Course[],
): DistributionResult {
  const state = initDistributionState(studentFaculty)
  const completedSet = new Set(completedIds)

  // Pre-apply completed courses so already-filled slots aren't re-assigned
  for (const course of completedCourses) {
    const faculty = resolveCourseFaculty(course, distributionChoices, state, studentFaculty)
    if (faculty) applyToSlot(course, faculty, state)
  }

  const assigned: Course[] = []

  for (const { course } of orderedCourses) {
    if (completedSet.has(course.id)) continue

    const faculty = resolveCourseFaculty(course, distributionChoices, state, studentFaculty)
    if (!faculty) continue
    if (!slotNeedsFilling(faculty, state)) continue
    if (!prefixAllowed(course.subjectPrefix, faculty, state)) continue

    applyToSlot(course, faculty, state)
    assigned.push(course)
  }

  return { assigned, distributionState: state }
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

function initDistributionState(studentFaculty: string): DistributionState {
  const slots: DistributionState['slots'] = {}
  for (const faculty of ALL_FACULTIES) {
    if (faculty !== studentFaculty) {
      slots[faculty] = { filled: 0, prefixCounts: {} }
    }
  }
  return { slots }
}

/**
 * Resolves which faculty category a course should count toward.
 * Priority: manual override → cross-listed slot that needs filling → primary faculty.
 * Returns null if the course is in the student's home faculty or not eligible.
 */
function resolveCourseFaculty(
  course: Course,
  choices: Record<string, string>,
  state: DistributionState,
  studentFaculty: string,
): string | null {
  // Manual override always wins
  if (choices[course.id]) {
    const override = choices[course.id]
    return override !== studentFaculty ? override : null
  }

  // Cross-listed: pick whichever slot still needs filling
  if (course.crossListedCode) {
    const primary = course.faculty
    const secondary = deriveSecondaryFaculty(course, studentFaculty)

    if (secondary && slotNeedsFilling(secondary, state)) return secondary
    if (primary !== studentFaculty && slotNeedsFilling(primary, state)) return primary
    return primary !== studentFaculty ? primary : (secondary ?? null)
  }

  return course.faculty !== studentFaculty ? course.faculty : null
}

function slotNeedsFilling(faculty: string, state: DistributionState): boolean {
  const slot = state.slots[faculty]
  return slot !== undefined && slot.filled < SLOTS_REQUIRED
}

function prefixAllowed(prefix: string, faculty: string, state: DistributionState): boolean {
  const slot = state.slots[faculty]
  if (!slot) return false
  return (slot.prefixCounts[prefix] ?? 0) < PREFIX_CAP
}

function applyToSlot(course: Course, faculty: string, state: DistributionState): void {
  const slot = state.slots[faculty]
  if (!slot) return
  slot.filled++
  slot.prefixCounts[course.subjectPrefix] = (slot.prefixCounts[course.subjectPrefix] ?? 0) + 1
}

/**
 * For a cross-listed course, infer the secondary faculty from the cross-listed code prefix.
 * VMCS/SPAN → the cross-listed code prefix doesn't directly map to a faculty,
 * so we fall back to the non-primary non-home faculty that still needs filling.
 */
function deriveSecondaryFaculty(course: Course, studentFaculty: string): string | null {
  return ALL_FACULTIES.find(f => f !== course.faculty && f !== studentFaculty) ?? null
}
