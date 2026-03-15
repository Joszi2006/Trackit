import { create } from 'zustand'
import type { Section } from '@/shared/types'

interface TrackitStore {
  studentId:           string | null
  /** true once the session hydration check has completed (success or empty) */
  sessionReady:        boolean
  selectedSchedule:    Section[] | null
  setStudentId:        (id: string) => void
  setSessionReady:     () => void
  setSelectedSchedule: (schedule: Section[]) => void
  clearSession:        () => void
}

export const useStore = create<TrackitStore>(set => ({
  studentId:           null,
  sessionReady:        false,
  selectedSchedule:    null,
  setStudentId:        id       => set({ studentId: id }),
  setSessionReady:     ()       => set({ sessionReady: true }),
  setSelectedSchedule: schedule => set({ selectedSchedule: schedule }),
  clearSession:        ()       => set({ studentId: null, selectedSchedule: null }),
}))
