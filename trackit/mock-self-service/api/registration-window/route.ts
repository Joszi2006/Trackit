// GET /api/mta/registration-window/:semester
// Simulates MtA Self-Service registration window status endpoint.
// In production, replace with real MtA API call (read-only).
import { findRegistrationWindow } from '@/backend/registrationWindowQuery'

export async function GET(semesterSlug: string) {
  const semesterStr = semesterSlug.replace(/-(\d{4})$/, ' $1').replace(/^(\w)/, c => c.toUpperCase())
  return findRegistrationWindow(semesterStr)
}
