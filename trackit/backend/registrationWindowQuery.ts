// Shared helper — fetches a registration window record for a semester string.
// Used by both the student-facing route and the MtA mock portal route.
import { prisma } from '@/backend/prisma'

export interface WindowResponse {
  semester:    string
  status:      'locked' | 'open' | 'completed'
  opensAt:     string | null
  closesAt:    string | null
  canRegister: boolean
}

export async function findRegistrationWindow(semester: string): Promise<WindowResponse> {
  const window = await prisma.registrationWindow.findUnique({ where: { semester } })
  return {
    semester,
    status:      (window?.status ?? 'locked') as WindowResponse['status'],
    opensAt:     (window?.opensAt.toISOString() ?? null),
    closesAt:    (window?.closesAt.toISOString() ?? null),
    canRegister: window?.status === 'open',
  }
}
