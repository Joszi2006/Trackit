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

// Fall YYYY ↔ Winter YYYY+1 are the same session — compute the sibling semester.
function sessionSibling(semester: string): string | null {
  const [term, yearStr] = semester.split(' ')
  const year = parseInt(yearStr, 10)
  if (term === 'Fall')   return `Winter ${year + 1}`
  if (term === 'Winter') return `Fall ${year - 1}`
  return null
}

export async function findRegistrationWindow(semester: string): Promise<WindowResponse> {
  const window = await prisma.registrationWindow.findUnique({ where: { semester } })
  if (window?.status === 'open') {
    return {
      semester,
      status:      'open',
      opensAt:     window.opensAt.toISOString(),
      closesAt:    window.closesAt.toISOString(),
      canRegister: true,
    }
  }

  // If this semester's window is locked/missing, check if the session sibling is open.
  // Fall 2026 and Winter 2027 share a registration period — if Fall is open, Winter is too.
  const sibling = sessionSibling(semester)
  if (sibling) {
    const siblingWindow = await prisma.registrationWindow.findUnique({ where: { semester: sibling } })
    if (siblingWindow?.status === 'open') {
      return {
        semester,
        status:      'open',
        opensAt:     siblingWindow.opensAt.toISOString(),
        closesAt:    siblingWindow.closesAt.toISOString(),
        canRegister: true,
      }
    }
  }

  return {
    semester,
    status:      (window?.status ?? 'locked') as WindowResponse['status'],
    opensAt:     (window?.opensAt.toISOString() ?? null),
    closesAt:    (window?.closesAt.toISOString() ?? null),
    canRegister: false,
  }
}
