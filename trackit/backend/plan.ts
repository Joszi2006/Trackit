// DraftPlan persistence — save and load CSP-generated schedules.
// The only backend file besides registration.ts that owns DraftPlan DB writes.
import { prisma } from '@/backend/prisma'
import type { Section, DraftPlan } from '@/shared/types'

type DraftPlanRecord = {
  id:        string
  studentId: string
  semester:  string
  schedules: unknown
  createdAt: Date
  updatedAt: Date
}

function mapRecord(record: DraftPlanRecord): DraftPlan {
  return {
    id:        record.id,
    studentId: record.studentId,
    semester:  record.semester,
    schedules: record.schedules as Section[][],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

// Upserts a draft — calling generate again replaces the previous draft for that semester.
// Returns the draft ID so the client can reload it later.
export async function saveDraftPlan(
  studentId: string,
  semester:  string,
  schedules: Section[][],
): Promise<string> {
  const serialized = JSON.parse(JSON.stringify(schedules)) as object
  const record = await prisma.draftPlan.upsert({
    where:  { studentId_semester: { studentId, semester } },
    update: { schedules: serialized },
    create: { studentId, semester, schedules: serialized },
    select: { id: true },
  })
  return record.id
}

export async function loadDraftPlan(
  studentId: string,
  semester:  string,
): Promise<DraftPlan | null> {
  const record = await prisma.draftPlan.findUnique({
    where: { studentId_semester: { studentId, semester } },
  })
  return record ? mapRecord(record) : null
}

export async function loadDraftPlanById(id: string): Promise<DraftPlan | null> {
  const record = await prisma.draftPlan.findUnique({ where: { id } })
  return record ? mapRecord(record) : null
}
