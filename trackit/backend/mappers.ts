// Converts Prisma output (null, wide strings) to shared type shapes (undefined, literal unions).
import type { Course, Section, Student } from '@/shared/types'

type PrismaCourse = {
  id: string; code: string; crossListedCode: string | null
  name: string; credits: number; programId: string; faculty: string
  subjectPrefix: string; year: number; isRequired: boolean
  prerequisites: string[]; corequisites: string[]
  semestersOffered: string[]; offeringFrequency: string
  lastOfferedYear: number | null; careerTags: string[]
  minYearStanding: number; programRestricted: boolean; description: string
}

type PrismaSection = {
  id: string; courseId: string; sectionCode: string; type: string
  semester: string; days: string[]; startTime: string; endTime: string
  instructor: string; room: string; totalSeats: number
  enrolledCount: number; waitlistCount: number
}

type PrismaStudent = {
  id: string; name: string; email: string; programId: string
  startYear: number; currentSemester: number; standing: string
  careerGoal: string | null; careerTags: string[]
  completedCourseIds: string[]; failedCourseIds: string[]
  distributionChoices: unknown
}

export function mapCourse(c: PrismaCourse): Course {
  return {
    ...c,
    crossListedCode:  c.crossListedCode  ?? undefined,
    lastOfferedYear:  c.lastOfferedYear  ?? undefined,
    offeringFrequency: c.offeringFrequency as Course['offeringFrequency'],
  }
}

export function mapSection(s: PrismaSection): Section {
  return { ...s, type: s.type as Section['type'] }
}

export function mapStudent(s: PrismaStudent): Student {
  return {
    ...s,
    standing:           s.standing as Student['standing'],
    careerGoal:         s.careerGoal ?? undefined,
    distributionChoices: (s.distributionChoices as Record<string, string>) ?? {},
  }
}
