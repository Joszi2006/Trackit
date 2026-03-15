// Mock MtA SIS — registration window status endpoint.
import { NextRequest, NextResponse } from 'next/server'
import { findRegistrationWindow } from '@/backend/registrationWindowQuery'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ semester: string }> },
) {
  try {
    const { semester } = await params
    const semesterStr = semester.replace(/-(\d{4})$/, ' $1').replace(/^(\w)/, c => c.toUpperCase())
    const window = await findRegistrationWindow(semesterStr)
    return NextResponse.json(window)
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
