/**
 * MtA Self-Service HTTP adapter.
 * In development, calls the mock routes at /api/mta/*.
 * In production, replace APP_URL with the real MtA API base and add auth headers.
 *
 * Set NEXT_PUBLIC_APP_URL=http://localhost:3000 in .env for local development.
 */
export type { MtaProfile } from '@/shared/types'
import type { MtaProfile } from '@/shared/types'

const MTA_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function fetchMtaProfile(email: string, _password: string): Promise<MtaProfile> {
  const url = `${MTA_BASE}/api/mta/transcript/${encodeURIComponent(email)}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.json() as { message?: string }
    throw new Error((body.message ?? `MtA transcript fetch failed: ${res.status}`))
  }
  return res.json() as Promise<MtaProfile>
}
