'use client'

import { useState } from 'react'
import type { BundleResult } from '@/shared/types'

interface UseRegistrationResult {
  results:     BundleResult | null
  isSubmitting: boolean
  error:        string | null
  submit:       (sectionIds: string[], preferWaitlist?: boolean) => Promise<void>
}

export function useRegistration(): UseRegistrationResult {
  const [results, setResults]         = useState<BundleResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function submit(sectionIds: string[], preferWaitlist = false) {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/register/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionIds, preferWaitlist }),
      })
      if (!res.ok) throw new Error((await res.json() as { message: string }).message)
      setResults(await res.json() as BundleResult)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { results, isSubmitting, error, submit }
}
