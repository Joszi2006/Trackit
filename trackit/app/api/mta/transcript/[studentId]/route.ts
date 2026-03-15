// Mock MtA SIS — transcript endpoint.
// Returns the student profile dispatched by email (the "student ID" in our mock).
import { NextRequest, NextResponse } from 'next/server'
import { buildMtaProfile } from '@/mock-self-service/mockMtaProfiles'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  try {
    const { studentId } = await params
    const email = decodeURIComponent(studentId)
    const password = req.nextUrl.searchParams.get('pw') ?? ''
    return NextResponse.json(buildMtaProfile(email, password))
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 401 })
  }
}
