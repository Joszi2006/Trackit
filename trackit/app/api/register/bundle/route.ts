import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/backend/session'
import { registerBundle } from '@/backend/engine/registration'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { sectionIds, preferWaitlist } = await req.json() as { sectionIds: string[]; preferWaitlist?: boolean }
    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
      return NextResponse.json({ message: 'sectionIds array required' }, { status: 400 })
    }

    const result = await registerBundle(session.studentId, sectionIds, preferWaitlist ?? false)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
