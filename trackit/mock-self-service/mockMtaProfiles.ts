/**
 * Mock MtA Self-Service user registry.
 * Each entry maps an email → { password, MtaProfile }.
 * Password is validated on login — wrong credentials throw an error.
 *
 * To add a new user: add one entry to USERS with their email, password,
 * and academic profile. On their first login the student is auto-created in the DB.
 */
import type { MtaProfile } from '@/shared/types'

interface MockUser {
  password: string
  profile:  MtaProfile
}

const USERS: Record<string, MockUser> = {
  'alex.johnson@mta.ca': {
    password: 'password123',
    profile: {
      name:                 'Alex Johnson',
      program:              'Computer Science',
      standing:             'good',
      startYear:            2024,
      currentSemester:      3,
      completedCourseCodes: ['COMP 1711', 'COMP 1721', 'MATH 1311', 'MATH 1211', 'MATH 1221', 'PHIL 1001', 'HIST 1001', 'MUSI 1001'],
      failedCourseCodes:    ['STAT 2111'],
    },
  },
  
  'test1@mta.ca': {
    password: 'test1pass',
    profile: {
      name:                 'Test One',
      program:              'Computer Science',
      standing:             'good',
      startYear:            2026,
      currentSemester:      1,
      completedCourseCodes: [],
      failedCourseCodes:    [],
    },
  },

  'miketa@mta.ca': {
    password: 'test1pass',
    profile: {
      name:                 'Mike Ta',
      program:              'Computer Science',
      standing:             'good',
      startYear:            2026,
      currentSemester:      1,
      completedCourseCodes: [],
      failedCourseCodes:    [],
    },
  },
  
  'josh@mta.ca': {
    password: 'test1pass',
    profile: {
      name:                 'Josh',
      program:              'Biology',
      standing:             'good',
      startYear:            2026,
      currentSemester:      1,
      completedCourseCodes: [],
      failedCourseCodes:    [],
    },
  },

  'test3@mta.ca': {
    password: 'test3pass',
    profile: {
      name:                 'Test Three',
      program:              'Computer Science',
      standing:             'probation',
      startYear:            2024,
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
    },
  },
}

export function buildMtaProfile(email: string, password: string): MtaProfile {
  const user = USERS[email.toLowerCase()]
  if (!user || user.password !== password) throw new Error('Invalid email or password')
  return user.profile
}
