'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/frontend/store'
import type { Course, Enrollment, RegistrationWindow, Section, Student } from '@/shared/types'

interface Program {
  id: string
  name: string
  faculty: string
  totalCredits: number
}

export interface StudentData {
  student:     Student
  program:     Program
  courses:     Course[]
  enrollments: Array<Enrollment & { section: Section & { course: Course } }>
  window:      RegistrationWindow | null
}

interface UseStudentResult {
  data:      StudentData | null
  isLoading: boolean
  error:     string | null
  refetch:   () => void
}

export function useStudent(): UseStudentResult {
  const studentId = useStore(s => s.studentId)
  const [data, setData]           = useState<StudentData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [tick, setTick]           = useState(0)

  useEffect(() => {
    if (!studentId) return
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/student/${studentId}`)
        if (!res.ok) throw new Error((await res.json() as { message: string }).message)
        const payload = await res.json() as StudentData
        if (!cancelled) setData(payload)
      } catch (err) {
        if (!cancelled) setError((err as Error).message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [studentId, tick])

  return { data, isLoading, error, refetch: () => setTick(t => t + 1) }
}
