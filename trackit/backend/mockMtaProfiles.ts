/**
 * Hardcoded MtA transcript profiles used by the mock self-service.
 * Dispatched by the last digit of the email username:
 *   1 → Year 1 Fall   (no credits)
 *   2 → Year 2 Winter (mid-Year-2)
 *   3 → Year 3 Fall   (with one failed course)
 *   * → Year 2 Fall   (default — all Year 1 passed)
 */
import type { MtaProfile } from '@/shared/types'

const CURRENT_YEAR = new Date().getFullYear()
const PLACEHOLDER_NAME = ''

const PROFILE_YEAR1_FALL: MtaProfile = {
  name:                 PLACEHOLDER_NAME,
  program:              'Computer Science',
  standing:             'good',
  startYear:            CURRENT_YEAR,
  currentSemester:      1,
  completedCourseCodes: [],
  failedCourseCodes:    [],
}

const PROFILE_YEAR2_FALL: MtaProfile = {
  name:                 PLACEHOLDER_NAME,
  program:              'Computer Science',
  standing:             'good',
  startYear:            CURRENT_YEAR - 1,
  currentSemester:      3,
  completedCourseCodes: [
    'COMP 1711', 'COMP 1721',
    'MATH 1211', 'MATH 1221',
    'PHIL 1001', 'ENGL 1021',
  ],
  failedCourseCodes: [],
}

const PROFILE_YEAR2_WINTER: MtaProfile = {
  name:                 PLACEHOLDER_NAME,
  program:              'Computer Science',
  standing:             'good',
  startYear:            CURRENT_YEAR - 1,
  currentSemester:      4,
  completedCourseCodes: [
    'COMP 1711', 'COMP 1721',
    'MATH 1211', 'MATH 1221',
    'PHIL 1001', 'ENGL 1021',
    'COMP 2711', 'STAT 2111',
  ],
  failedCourseCodes: [],
}

const PROFILE_YEAR3_FALL: MtaProfile = {
  name:                 PLACEHOLDER_NAME,
  program:              'Computer Science',
  standing:             'probation',
  startYear:            CURRENT_YEAR - 2,
  currentSemester:      5,
  completedCourseCodes: [
    'COMP 1711', 'COMP 1721',
    'MATH 1211', 'MATH 1221',
    'PHIL 1001', 'ENGL 1021',
    'COMP 2711',
    'COMP 2721', 'COMP 2731',
    'HIST 1001', 'MUSI 1001',
  ],
  failedCourseCodes: ['STAT 2111'],
}

function nameFromEmail(email: string): string {
  const username = (email.split('@')[0] ?? '').replace(/\d+$/, '') || (email.split('@')[0] ?? 'Student')
  return username
    .split(/[._-]/)
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ')
}

export function buildMtaProfile(email: string): MtaProfile {
  const key  = (email.split('@')[0] ?? '').at(-1) ?? ''
  const name = nameFromEmail(email)
  const base =
    key === '1' ? PROFILE_YEAR1_FALL   :
    key === '2' ? PROFILE_YEAR2_WINTER :
    key === '3' ? PROFILE_YEAR3_FALL   :
    PROFILE_YEAR2_FALL
  return { ...base, name }
}
