// Stage 1→2→3 pipeline — pure orchestration, no Prisma.
// Called by the API route after all DB fetching is done.
import { buildPrerequisiteGraph, handleFailedCourses } from './graph'
import { selectDistributionCourses } from './distribution'
import { generateSchedules } from './scheduler'
import type { Course, CourseNode, Section, Student, ScheduleResult, CoreqWarning } from '@/shared/types'

const MAX_BUNDLES = 10  // cap before passing to CSP solver; MRV ordering makes this effective

export interface PipelineInput {
  student:             Student
  studentFaculty:      string
  allCourses:          Course[]
  semesterSections:    Section[]  // sections available in the target semester
  existingEnrollments: Section[]  // already-registered sections (conflict anchors)
  targetYear:          number     // calendar year of the target semester, e.g. 2025
}

type Bundle = { course: CourseNode; sections: Section[]; required: boolean }

/**
 * Runs the three-stage planning pipeline and returns schedule options.
 * Stage 1: DAG + topological sort → ordered CourseNode list
 * Stage 2: Distribution requirement selector → fills distribution slots
 * Stage 3: CSP scheduler → up to 3 conflict-free ranked schedules
 */
export function runPipeline(input: PipelineInput): ScheduleResult {
  const { student, studentFaculty, allCourses, semesterSections, existingEnrollments, targetYear } = input

  // Stage 1 — graph
  const orderedNodes = buildPrerequisiteGraph(
    allCourses,
    student.completedCourseIds,
    student.failedCourseIds,
    student.careerTags,
  )

  const failedStatus = handleFailedCourses(allCourses, student.failedCourseIds, student.currentSemester)
  const retakableSet = new Set(failedStatus.retakable)
  const eligibleNodes = orderedNodes.filter(
    n => (n.depth === 0 || retakableSet.has(n.course.id))
      && isOfferedThisYear(n.course, targetYear),
  )

  // No sections seeded for this semester yet — avoid misleading scheduler error
  if (semesterSections.length === 0) {
    return {
      schedules:    [],
      canRegister:  false,
      canPreview:   false,
      message:      'No course sections are scheduled for this semester yet.',
      suggestions:  ['Sections are added as the registration window approaches.'],
    }
  }

  // Stage 2 — distribution
  const { assigned: distributionCourses } = selectDistributionCourses(
    eligibleNodes,
    studentFaculty,
    student.distributionChoices as Record<string, string>,
    student.completedCourseIds,
    allCourses.filter(c => student.completedCourseIds.includes(c.id)),
  )
  const distributionSet = new Set(distributionCourses.map(c => c.id))

  // Build section lookup
  const sectionsByCourse = new Map<string, Section[]>()
  for (const section of semesterSections) {
    const existing = sectionsByCourse.get(section.courseId) ?? []
    existing.push(section)
    sectionsByCourse.set(section.courseId, existing)
  }

  const allBundles: Bundle[] = eligibleNodes
    .filter(n => sectionsByCourse.has(n.course.id))
    .map(n => ({
      course:   n,
      sections: sectionsByCourse.get(n.course.id) ?? [],
      required: n.course.isRequired || retakableSet.has(n.course.id) || distributionSet.has(n.course.id),
    }))

  // Detect coreq warnings before trimming (run on full eligible set)
  const coreqWarnings = detectCoreqWarnings(allBundles, allCourses, student.completedCourseIds)

  // Stage 3 — select + sort bundles (MRV), then hand off to CSP solver
  const selectedBundles = selectBundles(allBundles, retakableSet)
  const result = generateSchedules(selectedBundles, existingEnrollments)

  return coreqWarnings.length > 0 ? { ...result, coreqWarnings } : result
}

/**
 * Finds courses whose co-requisites are absent from the bundle set.
 * Returns a warning for each missing pair so the UI can alert the student.
 */
function detectCoreqWarnings(
  bundles: Bundle[],
  allCourses: Course[],
  completedCourseIds: string[],
): CoreqWarning[] {
  const bundleCourseIds = new Set(bundles.map(b => b.course.course.id))
  const completedSet    = new Set(completedCourseIds)
  const courseCodeMap   = new Map(allCourses.map(c => [c.id, c.code]))

  const seen     = new Set<string>()
  const warnings: CoreqWarning[] = []

  for (const bundle of bundles) {
    const courseCode = bundle.course.course.code
    for (const coreqId of bundle.course.course.corequisites) {
      if (bundleCourseIds.has(coreqId)) continue  // co-req is in this semester's bundle
      if (completedSet.has(coreqId))    continue  // already completed — no warning needed
      const missingCode = courseCodeMap.get(coreqId) ?? coreqId
      const key = `${courseCode}:${missingCode}`
      if (!seen.has(key)) {
        seen.add(key)
        warnings.push({ courseCode, missingCoreqCode: missingCode })
      }
    }
  }
  return warnings
}

/**
 * Pre-selects and sorts bundles before the CSP solver.
 * Tier ordering: program-required/retakes → distribution → electives.
 * Within each tier, sort by section count ASC (MRV — most constrained first).
 * This compounds with forward checking: tight constraints propagate earliest.
 */
function selectBundles(bundles: Bundle[], retakableSet: Set<string>): Bundle[] {
  if (bundles.length <= MAX_BUNDLES) return sortByConstraint(bundles, retakableSet)

  const tier1 = bundles.filter(b => b.required && (b.course.course.isRequired || retakableSet.has(b.course.course.id)))
  const tier2 = bundles.filter(b => b.required && !b.course.course.isRequired && !retakableSet.has(b.course.course.id))
  const tier3 = bundles.filter(b => !b.required)

  const sortSections = (a: Bundle, b: Bundle) => a.sections.length - b.sections.length
  const sortElective = (a: Bundle, b: Bundle) => {
    const diff = a.sections.length - b.sections.length
    return diff !== 0 ? diff : b.course.careerScore - a.course.careerScore
  }

  return [
    ...tier1.sort(sortSections),
    ...tier2.sort(sortSections),
    ...tier3.sort(sortElective),
  ].slice(0, MAX_BUNDLES)
}

function sortByConstraint(bundles: Bundle[], retakableSet: Set<string>): Bundle[] {
  return [...bundles].sort((a, b) => {
    const tierOf = (x: Bundle) =>
      (x.required && (x.course.course.isRequired || retakableSet.has(x.course.course.id))) ? 0
      : x.required ? 1
      : 2
    const tierDiff = tierOf(a) - tierOf(b)
    return tierDiff !== 0 ? tierDiff : a.sections.length - b.sections.length
  })
}

// Returns false for every_two_years courses not offered in targetYear.
// Mirrors the same check in graph.ts handleFailedCourses for consistency.
function isOfferedThisYear(course: Course, targetYear: number): boolean {
  if (course.offeringFrequency !== 'every_two_years') return true
  if (course.lastOfferedYear === undefined) return false
  return (targetYear - course.lastOfferedYear) % 2 === 0
}
