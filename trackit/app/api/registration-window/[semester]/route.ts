import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/backend/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ semester: string }> }) {
  try {
    const { semester } = await params
    // Accept both URL-encoded ("fall-2025") and DB format ("Fall 2025")
    const semesterStr = semester.replace(/-(\d{4})$/, ' $1').replace(/^(\w)/, c => c.toUpperCase())

    const window = await prisma.registrationWindow.findUnique({ where: { semester: semesterStr } })

    return NextResponse.json({
      semester:    semesterStr,
      status:      (window?.status ?? 'locked') as 'locked' | 'open' | 'completed',
      opensAt:     window?.opensAt ?? null,
      closesAt:    window?.closesAt ?? null,
      canRegister: window?.status === 'open',
    })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
