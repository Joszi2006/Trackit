'use client'

import { useState } from 'react'
import { useStore } from '@/frontend/store'
import type { Section, CoreqWarning } from '@/shared/types'

export interface EnrolledSection {
  courseCode: string
  courseName: string
  days:       string[]
  startTime:  string
  endTime:    string
}

export interface PlanResult {
  schedules:          Section[][]
  canRegister:        boolean
  canPreview:         boolean
  message?:           string
  suggestions?:       string[]
  coreqWarnings?:     CoreqWarning[]
  alreadyRegistered?: boolean
  enrolledSections?:  EnrolledSection[]
}

interface UsePlanResult {
  result:     PlanResult | null
  isLoading:  boolean
  error:      string | null
  generate:   (semester: string) => Promise<void>
  advice:     string | null
  isAdvising: boolean
  advise:     (schedule: Section[]) => Promise<void>
}

export function usePlan(): UsePlanResult {
  const studentId = useStore(s => s.studentId)
  const [result, setResult]         = useState<PlanResult | null>(null)
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [advice, setAdvice]         = useState<string | null>(null)
  const [isAdvising, setIsAdvising] = useState(false)

  async function generate(semester: string) {
    if (!studentId) { setError('Not logged in'); return }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semester }),
      })
      if (!res.ok) throw new Error((await res.json() as { message: string }).message)
      setResult(await res.json() as PlanResult)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  async function advise(schedule: Section[]) {
    setIsAdvising(true)
    setAdvice(null)
    try {
      const res = await fetch('/api/plan/advise', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ schedule }),
      })
      if (res.ok) {
        const data = await res.json() as { advice: string }
        setAdvice(data.advice)
      }
    } catch {
      // advice is decorative — silent fail
    } finally {
      setIsAdvising(false)
    }
  }

  return { result, isLoading, error, generate, advice, isAdvising, advise }
}
