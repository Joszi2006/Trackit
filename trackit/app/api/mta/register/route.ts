// Mock MtA SIS — registration endpoint.
// Proxies to the engine's registerBundle — same logic as the student-facing route
// but accepts studentId directly in the body (no session auth, MtA portal handles its own auth).
import { NextRequest, NextResponse } from 'next/server'
import { registerBundle } from '@/backend/engine/registration'

interface MtaRegisterBody {
  studentId:      string
  sectionIds:     string[]
  preferWaitlist?: boolean
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as MtaRegisterBody
    const { studentId, sectionIds, preferWaitlist } = body

    if (!studentId || !Array.isArray(sectionIds) || sectionIds.length === 0) {
      return NextResponse.json({ message: 'studentId and sectionIds are required' }, { status: 400 })
    }

    const result = await registerBundle(studentId, sectionIds, (preferWaitlist ?? false))
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
