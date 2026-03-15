import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { getSession } from '@/backend/session'
import { mapCourse } from '@/backend/mappers'

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const rawCourses = await prisma.course.findMany()
    const courses = rawCourses.map(mapCourse)
    return NextResponse.json({ courses })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
