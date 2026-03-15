// Stage 4 — Bundle Registration
// Only engine file that touches the database.
// All seat/enrollment checks run inside Prisma transactions — never outside.
import { Prisma } from '@prisma/client'
import { prisma } from '@/backend/prisma'
import type { BundleResult, RegistrationStatus, SectionResult } from '@/shared/types'

const MAX_CREDITS = 15

// Internal shape — richer than the shared Section type, includes courseId + course metadata
interface SectionMeta {
  id: string
  courseId: string
  totalSeats: number
  semester: string
  course: { code: string; credits: number; isRequired: boolean; corequisites: string[] }
}

interface RegistrationContext {
  semester: string
  completedCourseIds: Set<string>   // Set for O(1) lookup inside transaction
  sectionMap: Map<string, SectionMeta>
  preferWaitlist: boolean           // when true, full sections become waitlist instead of fail
}

// ─────────────────────────────────────────────
// Exported — Stage 4 entry point
// ─────────────────────────────────────────────

export async function registerBundle(
  studentId: string,
  sectionIds: string[],
  preferWaitlist: boolean,
): Promise<BundleResult> {
  const window = await prisma.registrationWindow.findFirst({ where: { status: 'open' } })
  if (!window) {
    return buildFailResult(sectionIds, 'Registration window is not open')
  }

  const [sections, student] = await Promise.all([
    prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true, courseId: true, totalSeats: true, semester: true, course: { select: { code: true, credits: true, isRequired: true, corequisites: true } } },
    }),
    prisma.student.findUnique({ where: { id: studentId }, select: { completedCourseIds: true } }),
  ])

  if (!student) return buildFailResult(sectionIds, 'Student not found')

  const sectionMap = new Map(sections.map(s => [s.id, s]))
  const enrollmentSemester = sections[0]?.semester ?? window.semester
  const context: RegistrationContext = {
    semester: enrollmentSemester,
    completedCourseIds: new Set(student.completedCourseIds),
    sectionMap,
    preferWaitlist,
  }

  const groups = groupByCoReqs(sectionIds, sectionMap)
  const results: SectionResult[] = []
  const successfulIds: string[] = []
  let partialFailure = false

  for (const group of groups) {
    const groupResults = group.length === 1
      ? [await registerSingle(studentId, group[0], context)]
      : await registerGroup(studentId, group, context)

    for (const r of groupResults) {
      results.push(r)
      if (r.status === 'enrolled' || r.status === 'waitlisted') {
        successfulIds.push(r.sectionId)
      } else if (sectionMap.get(r.sectionId)?.course.isRequired) {
        partialFailure = true
      }
    }
  }

  return { results, partialFailure, successfulIds }
}

// ─────────────────────────────────────────────
// Internal — transaction wrappers
// ─────────────────────────────────────────────

async function registerSingle(
  studentId: string,
  sectionId: string,
  context: RegistrationContext,
): Promise<SectionResult> {
  const courseCode = context.sectionMap.get(sectionId)?.course.code ?? ''
  try {
    const status = await prisma.$transaction(
      tx => performRegistration(tx, studentId, sectionId, context),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
    return { sectionId, courseCode, status }
  } catch (err) {
    return { sectionId, courseCode, status: 'failed', reason: (err as Error).message }
  }
}

async function registerGroup(
  studentId: string,
  sectionIds: string[],
  context: RegistrationContext,
): Promise<SectionResult[]> {
  const statuses = new Map<string, RegistrationStatus>()
  try {
    await prisma.$transaction(
      async (tx) => {
        for (const sectionId of sectionIds) {
          const status = await performRegistration(tx, studentId, sectionId, context)
          statuses.set(sectionId, status)
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
    return sectionIds.map(id => ({
      sectionId: id,
      courseCode: context.sectionMap.get(id)?.course.code ?? '',
      status: statuses.get(id) ?? 'enrolled',
    }))
  } catch (err) {
    return sectionIds.map(id => ({
      sectionId: id,
      courseCode: context.sectionMap.get(id)?.course.code ?? '',
      status: 'failed' as const,
      reason: (err as Error).message,
    }))
  }
}

// ─────────────────────────────────────────────
// Internal — all checks + insert (runs inside a transaction)
// ─────────────────────────────────────────────

async function performRegistration(
  tx: Prisma.TransactionClient,
  studentId: string,
  sectionId: string,
  context: RegistrationContext,
): Promise<RegistrationStatus> {
  const window = await tx.registrationWindow.findFirst({ where: { status: 'open' } })
  if (!window) throw new Error('Registration window closed')

  const section = await tx.section.findUnique({ where: { id: sectionId }, include: { course: true } })
  if (!section) throw new Error('Section not found')

  const duplicate = await tx.enrollment.findUnique({
    where: { studentId_sectionId: { studentId, sectionId } },
  })
  if (duplicate) throw new Error('Already enrolled in this section')

  const sameCourseSec = await tx.enrollment.findFirst({
    where: { studentId, section: { courseId: section.courseId }, status: 'enrolled' },
  })
  if (sameCourseSec) throw new Error('Already enrolled in another section of this course')

  if (context.completedCourseIds.has(section.courseId)) throw new Error('Course already completed')

  const enrolled = await tx.enrollment.findMany({
    where: { studentId, status: 'enrolled', semester: context.semester },
    include: { section: { include: { course: { select: { credits: true } } } } },
  })
  const usedCredits = enrolled.reduce((sum, e) => sum + e.section.course.credits, 0)
  if (usedCredits + section.course.credits > MAX_CREDITS) {
    throw new Error(`Credit limit of ${MAX_CREDITS} would be exceeded`)
  }

  // Seat check — branch on waitlist preference
  if (section.enrolledCount >= section.totalSeats) {
    if (!context.preferWaitlist) throw new Error('No seats available')
    return enrollOnWaitlist(tx, studentId, sectionId, context.semester)
  }

  await tx.section.update({ where: { id: sectionId }, data: { enrolledCount: { increment: 1 } } })
  await tx.enrollment.create({ data: { studentId, sectionId, status: 'enrolled', semester: context.semester } })
  return 'enrolled'
}

async function enrollOnWaitlist(
  tx: Prisma.TransactionClient,
  studentId: string,
  sectionId: string,
  semester: string,
): Promise<RegistrationStatus> {
  await tx.section.update({ where: { id: sectionId }, data: { waitlistCount: { increment: 1 } } })
  await tx.enrollment.create({ data: { studentId, sectionId, status: 'waitlisted', semester } })
  return 'waitlisted'
}

// ─────────────────────────────────────────────
// Internal — pure helpers
// ─────────────────────────────────────────────

function groupByCoReqs(sectionIds: string[], sectionMap: Map<string, SectionMeta>): string[][] {
  const visited = new Set<string>()
  const groups: string[][] = []

  for (const sectionId of sectionIds) {
    if (visited.has(sectionId)) continue
    const section = sectionMap.get(sectionId)
    if (!section) { groups.push([sectionId]); visited.add(sectionId); continue }

    const coReqSectionIds = sectionIds.filter(id => {
      if (id === sectionId) return false
      const other = sectionMap.get(id)
      return other && section.course.corequisites.includes(other.courseId)
    })

    const group = [sectionId, ...coReqSectionIds]
    group.forEach(id => visited.add(id))
    groups.push(group)
  }

  return groups
}

function buildFailResult(sectionIds: string[], reason: string): BundleResult {
  return {
    results: sectionIds.map(id => ({ sectionId: id, courseCode: '', status: 'failed', reason })),
    partialFailure: true,
    successfulIds: [],
  }
}
