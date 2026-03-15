import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { getSession } from '@/backend/session'
import { adviseSchedule } from '@/backend/ai/adviseSchedule'
import type { Section } from '@/shared/types'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { schedule } = await req.json() as { schedule: Section[] }
    const studentId    = session.studentId

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { program: true },
    })
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 })
    }

    const courseIds = [...new Set(schedule.map(s => s.courseId))]
    const dbCourses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, code: true, name: true },
    })

    const courseMap = new Map(dbCourses.map(c => [c.id, c]))
    const scheduleCourses = courseIds
      .map(id => courseMap.get(id))
      .filter((c): c is { id: string; code: string; name: string } => c !== undefined)

    const advice = await adviseSchedule({
      careerGoal:      (student.careerGoal ?? ''),
      careerTags:      student.careerTags,
      program:         student.program.name,
      currentSemester: student.currentSemester,
      schedule:        scheduleCourses,
    })

    return NextResponse.json({ advice })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
