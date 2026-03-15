// POST /api/mta/register
// Simulates MtA Self-Service registration endpoint.
// Proxies to the engine's registerBundle — same logic as the student-facing route
// but accepts studentId directly (MtA portal handles its own auth).
// In production, student registers manually — Trackit only recommends.
import { registerBundle } from '@/backend/engine/registration'

export async function POST(studentId: string, sectionIds: string[], preferWaitlist = false) {
  return registerBundle(studentId, sectionIds, preferWaitlist)
}
