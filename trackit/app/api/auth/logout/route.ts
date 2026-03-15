import { NextResponse } from 'next/server'
import { getSession } from '@/backend/session'

export async function POST() {
  try {
    const session = await getSession()
    session.destroy()
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
