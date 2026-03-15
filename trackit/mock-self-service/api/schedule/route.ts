// GET /api/mta/schedule/:studentId
// Simulates MtA Self-Service current schedule endpoint.
// Returns all currently-enrolled sections for a student.
// In production, replace with real MtA API call (read-only).
import { prisma }     from '@/backend/prisma'
import { mapSection } from '@/backend/mappers'

export async function GET(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where:   { studentId, status: 'enrolled' },
    include: { section: true },
  })
  return { sections: enrollments.map(e => mapSection(e.section)) }
}
