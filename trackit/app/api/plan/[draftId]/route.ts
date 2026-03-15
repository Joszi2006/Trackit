import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/backend/session'
import { loadDraftPlanById } from '@/backend/plan'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> },
) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.studentId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { draftId } = await params
    const draft = await loadDraftPlanById(draftId)

    if (!draft || draft.studentId !== session.studentId) {
      return NextResponse.json({ message: 'Draft not found' }, { status: 404 })
    }

    return NextResponse.json(draft)
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
