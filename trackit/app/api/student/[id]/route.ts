import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { getSession } from '@/backend/session'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (id !== session.studentId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const [student, courses, enrollments, openWindow] = await Promise.all([
      prisma.student.findUnique({
        where: { id },
        include: { program: true },
      }),
      prisma.course.findMany(),
      prisma.enrollment.findMany({
        where: { studentId: id },
        include: { section: { include: { course: true } } },
      }),
      prisma.registrationWindow.findFirst({ where: { status: 'open' }, orderBy: { opensAt: 'desc' } }),
    ])

    if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 })

    return NextResponse.json({ student, program: student.program, courses, enrollments, window: openWindow })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
