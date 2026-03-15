// Mock MtA SIS — current enrolled schedule for a student.
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { mapSection } from '@/backend/mappers'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { studentId } = await params
    const enrollments = await prisma.enrollment.findMany({
      where:   { studentId, status: 'enrolled' },
      include: { section: true },
    })
    const sections = enrollments.map(e => e.section).map(mapSection)
    return NextResponse.json({ sections })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
