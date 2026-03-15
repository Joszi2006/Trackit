import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { getSession } from '@/backend/session'
import { selectDistributionCourses } from '@/backend/engine/distribution'
import { buildPrerequisiteGraph } from '@/backend/engine/graph'
import { mapCourse } from '@/backend/mappers'
import type { CourseNode } from '@/shared/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const [student, rawCourses, enrollments] = await Promise.all([
      prisma.student.findUnique({ where: { id }, include: { program: true } }),
      prisma.course.findMany(),
      prisma.enrollment.findMany({
        where: { studentId: id },
        include: { section: { include: { course: true } } },
      }),
    ])

    if (!student) return NextResponse.json({ message: 'Student not found' }, { status: 404 })

    const courses = rawCourses.map(mapCourse)
    const completedCourses = courses.filter(c => student.completedCourseIds.includes(c.id))
    const orderedNodes: CourseNode[] = buildPrerequisiteGraph(courses, student.completedCourseIds, student.failedCourseIds, student.careerTags)

    const { distributionState } = selectDistributionCourses(
      orderedNodes,
      student.program.faculty,
      student.distributionChoices as Record<string, string>,
      student.completedCourseIds,
      completedCourses,
    )

    const creditsCompleted = completedCourses.reduce((sum, c) => sum + c.credits, 0)

    // Group enrollments by semester string
    const byKey = new Map<string, typeof enrollments>()
    for (const e of enrollments) {
      const key = e.semester
      const arr = byKey.get(key) ?? []
      arr.push(e)
      byKey.set(key, arr)
    }
    const semesterHistory = Array.from(byKey.entries()).map(([semester, enrs]) => ({
      semester,
      courses: enrs.map(e => ({
        code:    e.section.course.code,
        name:    e.section.course.name,
        credits: e.section.course.credits,
        status:  student.completedCourseIds.includes(e.section.course.id) ? 'P'
               : student.failedCourseIds.includes(e.section.course.id) ? 'F' : 'IP',
      })),
    }))

    return NextResponse.json({
      creditsCompleted,
      creditsRequired: student.program.totalCredits,
      distributionState,
      semesterHistory,
    })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
