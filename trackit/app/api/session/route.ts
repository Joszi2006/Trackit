import { NextResponse } from 'next/server'
import { getSession } from '@/backend/session'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn || !session.studentId) {
    return NextResponse.json({ studentId: null })
  }
  return NextResponse.json({ studentId: session.studentId })
}
