import { prisma } from '@/backend/prisma'
import type { MtaProfile } from '@/shared/types'

interface SyncData {
  programId:          string
  completedCourseIds: string[]
  failedCourseIds:    string[]
  currentSemester:    number
  standing:           'good' | 'probation'
  startYear:          number
}

// Resolves course codes → IDs, silently drops codes not in DB (expected for mock adapter)
async function resolveCourseIds(codes: string[]): Promise<string[]> {
  if (codes.length === 0) return []
  const courses = await prisma.course.findMany({
    where:  { code: { in: codes } },
    select: { id: true },
  })
  return courses.map(c => c.id)
}

// Resolves all profile fields to DB IDs. Throws if program not found.
export async function buildSyncData(profile: MtaProfile): Promise<SyncData> {
  const program = await prisma.program.findUnique({ where: { name: profile.program } })
  if (!program) {
    throw new Error(`Program from self-service not found in system: ${profile.program}`)
  }

  const [completedCourseIds, failedCourseIds] = await Promise.all([
    resolveCourseIds(profile.completedCourseCodes),
    resolveCourseIds(profile.failedCourseCodes),
  ])

  return {
    programId: program.id,
    completedCourseIds,
    failedCourseIds,
    currentSemester: profile.currentSemester,
    standing:        profile.standing,
    startYear:       profile.startYear,
  }
}

// Fetches profile + writes updated academic data to student row.
// Does NOT touch careerGoal, careerTags, or distributionChoices.
export async function syncStudentProfile(studentId: string, profile: MtaProfile): Promise<void> {
  const syncData = await buildSyncData(profile)
  await prisma.student.update({
    where: { id: studentId },
    data: {
      programId:         syncData.programId,
      completedCourseIds: syncData.completedCourseIds,
      failedCourseIds:    syncData.failedCourseIds,
      currentSemester:    syncData.currentSemester,
      standing:           syncData.standing,
      startYear:          syncData.startYear,
    },
  })
}
