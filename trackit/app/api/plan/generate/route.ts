import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { getSession } from '@/backend/session'
import { runPipeline } from '@/backend/engine/pipeline'
import { saveDraftPlan } from '@/backend/plan'
import { mapCourse, mapSection, mapStudent } from '@/backend/mappers'
import { findRegistrationWindow } from '@/backend/registrationWindowQuery'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { semester } = await req.json() as { semester: string }
    if (!semester) return NextResponse.json({ message: 'semester required' }, { status: 400 })

    const targetYear = parseInt((semester.split(' ').at(-1) ?? '0'), 10)
    const studentId  = session.studentId

    const [student, rawCourses, rawSections, regWindow] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, include: { program: true } }),
      prisma.course.findMany(),
      prisma.section.findMany({ where: { semester } }),
      findRegistrationWindow(semester),
    ])

    if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 })

    const rawEnrolled = await prisma.section.findMany({
      where: { enrollments: { some: { studentId, status: 'enrolled', semester } } },
    })

    const result = runPipeline({
      student:             mapStudent(student),
      studentFaculty:      student.program.faculty,
      allCourses:          rawCourses.map(mapCourse),
      semesterSections:    rawSections.map(mapSection),
      existingEnrollments: rawEnrolled.map(mapSection),
      targetYear,
    })

    const draftId = await saveDraftPlan(studentId, semester, result.schedules)

    return NextResponse.json({ ...result, canRegister: regWindow.canRegister && result.canRegister, draftId })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
