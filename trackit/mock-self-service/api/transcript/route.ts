// GET /api/mta/transcript/:studentId
// Simulates MtA Self-Service transcript endpoint.
// In production, replace with real MtA API call (read-only).
import { buildMtaProfile } from '@/mock-self-service/mockMtaProfiles'

export function GET(studentId: string) {
  const email = decodeURIComponent(studentId)
  return buildMtaProfile(email)
}
