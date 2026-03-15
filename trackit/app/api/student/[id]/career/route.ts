import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'
import { getSession } from '@/backend/session'
import { parseCareerGoal } from '@/backend/ai/parseGoal'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { goal } = await req.json() as { goal: string }
    if (!goal?.trim()) return NextResponse.json({ message: 'goal required' }, { status: 400 })

    const careerTags = await parseCareerGoal(goal)

    await prisma.student.update({
      where: { id },
      data:  { careerGoal: goal, careerTags },
    })

    return NextResponse.json({ careerTags })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
