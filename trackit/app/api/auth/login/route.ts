import { NextRequest, NextResponse } from 'next/server'
import { prisma }             from '@/backend/prisma'
import { getSession }         from '@/backend/session'
import { fetchMtaProfile }    from '@/mock-self-service/selfService'
import { buildSyncData, syncStudentProfile } from '@/backend/syncProfile'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Authenticate against self-service (mock: calls /api/mta/transcript)
    // Production: this call throws if credentials are invalid
    const mtaProfile = await fetchMtaProfile(normalizedEmail, password)

    const session = await getSession()

    const existing = await prisma.student.findUnique({
      where:  { email: normalizedEmail },
      select: { id: true, name: true, careerTags: true },
    })

    if (existing) {
      // Returning student — sync transcript and log in
      await syncStudentProfile(existing.id, mtaProfile)
      session.studentId  = existing.id
      session.isLoggedIn = true
      await session.save()

      const hasCareerGoal = existing.careerTags.length > 0
      return NextResponse.json({ studentId: existing.id, name: existing.name, hasCareerGoal })
    }

    // New student — create account from self-service data
    const syncData = await buildSyncData(mtaProfile)
    const student  = await prisma.student.create({
      data: {
        name:                mtaProfile.name,
        email:               normalizedEmail,
        password,
        programId:           syncData.programId,
        startYear:           syncData.startYear,
        currentSemester:     syncData.currentSemester,
        standing:            syncData.standing,
        careerTags:          [],
        completedCourseIds:  syncData.completedCourseIds,
        failedCourseIds:     syncData.failedCourseIds,
        distributionChoices: {},
      },
    })

    session.studentId  = student.id
    session.isLoggedIn = true
    await session.save()

    return NextResponse.json({ studentId: student.id, name: student.name, hasCareerGoal: false }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 })
  }
}
