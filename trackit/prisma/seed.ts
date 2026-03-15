import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ─────────────────────────────────────────────
// PROGRAMS
// ─────────────────────────────────────────────
const programData = [
  {
    name: 'Computer Science',
    faculty: 'Science',
    totalCredits: 120,
    description: 'Study of computation, algorithms, and software systems.',
  },
  {
    name: 'Biology',
    faculty: 'Science',
    totalCredits: 120,
    description: 'Study of living organisms and biological systems.',
  },
  {
    name: 'Business Administration',
    faculty: 'Social Sciences',
    totalCredits: 120,
    description: 'Study of business management, economics, and organisational behaviour.',
  },
]

// ─────────────────────────────────────────────
// DISTRIBUTION COURSES (shared pool)
// Min 4 per category, mix of subject prefixes
// Cross-listed courses stored as ONE record
// ─────────────────────────────────────────────
const distributionCourseData = [
  // Humanities
  {
    code: 'PHIL 1001', name: 'Introduction to Philosophy',
    faculty: 'Humanities', subjectPrefix: 'PHIL',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['ethics', 'critical-thinking'],
    description: 'Foundational questions in metaphysics, epistemology, and ethics.',
  },
  {
    code: 'HIST 1001', name: 'World History to 1500',
    faculty: 'Humanities', subjectPrefix: 'HIST',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['writing', 'research'],
    description: 'Survey of world civilisations from antiquity to the late medieval period.',
  },
  {
    code: 'ENGL 1021', name: 'Academic Writing and Rhetoric',
    faculty: 'Humanities', subjectPrefix: 'ENGL',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['writing', 'communication'],
    description: 'Develops skills in academic argumentation, research, and writing.',
  },
  {
    code: 'RELI 1001', name: 'Introduction to World Religions',
    faculty: 'Humanities', subjectPrefix: 'RELI',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['ethics', 'culture'],
    description: 'Comparative study of major world religions and their traditions.',
  },

  // Arts & Letters
  {
    code: 'MUSI 1001', name: 'Introduction to Music',
    faculty: 'Arts & Letters', subjectPrefix: 'MUSI',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['arts', 'culture'],
    description: 'Survey of Western music history and basic music theory.',
  },
  {
    code: 'FINA 1001', name: 'Introduction to Fine Arts',
    faculty: 'Arts & Letters', subjectPrefix: 'FINA',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['arts', 'visual-culture'],
    description: 'Survey of visual art history from ancient to contemporary.',
  },
  {
    code: 'DRAM 1001', name: 'Introduction to Theatre',
    faculty: 'Arts & Letters', subjectPrefix: 'DRAM',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['performance', 'communication'],
    description: 'History and practice of theatrical performance.',
  },
  {
    // Cross-listed: VMCS 1821 / SPAN 1821 — ONE record, student picks which faculty it counts toward
    code: 'VMCS 1821', crossListedCode: 'SPAN 1821',
    name: 'Spanish Language and Visual Culture',
    faculty: 'Arts & Letters', subjectPrefix: 'VMCS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['language', 'visual-culture', 'culture'],
    description: 'Intermediate Spanish through the lens of Latin American visual culture.',
  },

  // Social Sciences
  {
    code: 'ECON 1001', name: 'Introduction to Economics',
    faculty: 'Social Sciences', subjectPrefix: 'ECON',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['economics', 'finance', 'business'],
    description: 'Principles of micro and macroeconomics.',
  },
  {
    code: 'SOCI 1001', name: 'Introduction to Sociology',
    faculty: 'Social Sciences', subjectPrefix: 'SOCI',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['society', 'culture', 'research'],
    description: 'Sociological perspectives on society, institutions, and social change.',
  },
  {
    code: 'PSYC 1001', name: 'Introduction to Psychology',
    faculty: 'Social Sciences', subjectPrefix: 'PSYC',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['psychology', 'health-sciences', 'research'],
    description: 'Foundations of human behaviour, cognition, and mental processes.',
  },
  {
    code: 'POLS 1001', name: 'Introduction to Political Science',
    faculty: 'Social Sciences', subjectPrefix: 'POLS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['political-science', 'ethics', 'writing'],
    description: 'Comparative politics, political theory, and international relations.',
  },

  // Science (for non-science programs)
  {
    code: 'PHYS 1001', name: 'Introduction to Physics',
    faculty: 'Science', subjectPrefix: 'PHYS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['physics', 'engineering'],
    description: 'Mechanics, thermodynamics, and waves.',
  },
  {
    code: 'CHEM 1001', name: 'Introduction to Chemistry',
    faculty: 'Science', subjectPrefix: 'CHEM',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['chemistry', 'biology', 'health-sciences'],
    description: 'Atomic structure, bonding, reactions, and stoichiometry.',
  },
  {
    code: 'BIOL 1001', name: 'Introduction to Biology',
    faculty: 'Science', subjectPrefix: 'BIOL',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['biology', 'health-sciences', 'research'],
    description: 'Cell biology, genetics, evolution, and ecology.',
  },
  {
    code: 'ENVS 1001', name: 'Introduction to Environmental Science',
    faculty: 'Science', subjectPrefix: 'ENVS',
    year: 1, credits: 3, isRequired: false,
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['environment', 'biology', 'research'],
    description: 'Earth systems, ecology, and environmental issues.',
  },
]

// ─────────────────────────────────────────────
// CS COURSES
// prerequisites listed as course CODES — resolved to IDs after insert
// ─────────────────────────────────────────────
const csCourseData = [
  // Year 1
  {
    code: 'COMP 1711', name: 'Introduction to Programming',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 1, credits: 3, isRequired: true,
    prerequisites: [], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['programming', 'fullstack', 'backend', 'algorithms'],
    description: 'Problem solving and programming using Python.',
  },
  {
    code: 'COMP 1721', name: 'Object-Oriented Programming',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 1, credits: 3, isRequired: true,
    prerequisites: ['COMP 1711'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['programming', 'fullstack', 'backend', 'algorithms'],
    description: 'Object-oriented design and programming using Java.',
  },
  {
    code: 'MATH 1211', name: 'Calculus I',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 1, credits: 3, isRequired: true,
    prerequisites: [], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['mathematics', 'machine-learning', 'data-science'],
    description: 'Limits, derivatives, and integrals of single-variable functions.',
  },
  {
    code: 'MATH 1221', name: 'Calculus II',
    faculty: 'Science', subjectPrefix: 'MATH',
    year: 1, credits: 3, isRequired: true,
    prerequisites: ['MATH 1211'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['mathematics', 'machine-learning', 'data-science'],
    description: 'Integration techniques, sequences, and series.',
  },

  // Year 2
  {
    code: 'COMP 2711', name: 'Data Structures and Algorithms',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['COMP 1721'], corequisites: ['STAT 2111'],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['algorithms', 'backend', 'machine-learning', 'data-science'],
    description: 'Arrays, linked lists, trees, graphs, sorting, and searching.',
  },
  {
    code: 'COMP 2721', name: 'Computer Architecture',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['COMP 1721'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['systems', 'backend'],
    description: 'Processor design, memory hierarchy, and instruction set architecture.',
  },
  {
    // Coreq with COMP 2721 (Winter-only) → triggers co-reg warning when planning Fall
    code: 'COMP 2731', name: 'Software Engineering',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['COMP 1721'], corequisites: ['COMP 2721'],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['fullstack', 'backend', 'programming'],
    description: 'Software design, testing, version control, and team development.',
  },
  {
    code: 'STAT 2111', name: 'Probability and Statistics',
    faculty: 'Science', subjectPrefix: 'STAT',
    year: 2, credits: 3, isRequired: true,
    prerequisites: ['MATH 1221'], corequisites: ['COMP 2711'],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_year',
    careerTags: ['statistics', 'machine-learning', 'data-science'],
    description: 'Probability theory, distributions, inference, and regression.',
  },

  // Year 3
  {
    code: 'COMP 3711', name: 'Algorithm Design and Analysis',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: true,
    prerequisites: ['COMP 2711'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['algorithms', 'machine-learning', 'backend'],
    description: 'Complexity, dynamic programming, greedy algorithms, NP-completeness.',
  },
  {
    code: 'COMP 3721', name: 'Database Systems',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: true,
    prerequisites: ['COMP 2711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['backend', 'data-science', 'fullstack'],
    description: 'Relational model, SQL, transactions, indexing, and query optimisation.',
  },
  {
    code: 'COMP 3731', name: 'Computer Graphics',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 3, credits: 3, isRequired: false,
    prerequisites: ['COMP 2711'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_two_years',
    lastOfferedYear: 2024,
    careerTags: ['visual-culture', 'programming'],
    description: 'Rendering, rasterisation, shading, and 3D transformations.',
  },

  // Year 4
  {
    code: 'COMP 4711', name: 'Machine Learning',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3711'], corequisites: [],
    semestersOffered: ['Fall'], offeringFrequency: 'every_year',
    careerTags: ['machine-learning', 'data-science', 'algorithms'],
    description: 'Supervised and unsupervised learning, neural networks, and model evaluation.',
  },
  {
    code: 'COMP 4721', name: 'Distributed Systems',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 3, isRequired: false,
    prerequisites: ['COMP 3711'], corequisites: [],
    semestersOffered: ['Winter'], offeringFrequency: 'every_year',
    careerTags: ['backend', 'systems', 'fullstack'],
    description: 'Consensus, replication, fault tolerance, and distributed storage.',
  },
  {
    code: 'COMP 4731', name: 'Capstone Project',
    faculty: 'Science', subjectPrefix: 'COMP',
    year: 4, credits: 6, isRequired: true,
    prerequisites: ['COMP 3711'], corequisites: [],
    semestersOffered: ['Fall', 'Winter'], offeringFrequency: 'every_semester',
    careerTags: ['programming', 'fullstack', 'backend', 'machine-learning'],
    description: 'Year-long software development project with an industry or research partner.',
  },
]

// ─────────────────────────────────────────────
// HELPER — generate standard sections for a course
// Each course gets one section per time slot (5 MWF + 5 TTh = 10 sections).
// This guarantees the CSP solver can always find a conflict-free
// schedule regardless of which courses end up required together.
// Labs: W afternoon, 5 seats (waitlist demo)
// ─────────────────────────────────────────────
const MWF_SLOTS = [
  { code: '001', start: '08:30', end: '09:20', room: 'Dunn 101' },
  { code: '002', start: '09:30', end: '10:20', room: 'Dunn 102' },
  { code: '003', start: '10:30', end: '11:20', room: 'Dunn 201' },
  { code: '004', start: '11:30', end: '12:20', room: 'Dunn 202' },
  { code: '005', start: '13:00', end: '13:50', room: 'Dunn 301' },
]

const TTH_SLOTS = [
  { code: '006', start: '08:30', end: '09:45', room: 'Dunn 103' },
  { code: '007', start: '10:00', end: '11:15', room: 'Dunn 203' },
  { code: '008', start: '11:30', end: '12:45', room: 'Dunn 204' },
  { code: '009', start: '13:00', end: '14:15', room: 'Dunn 206' },
  { code: '010', start: '14:30', end: '15:45', room: 'Dunn 302' },
]

function makeSections(courseId: string, semester: string, hasLab = false) {
  const sections = [
    ...MWF_SLOTS.map(slot => ({
      courseId, sectionCode: slot.code, type: 'lecture', semester,
      days: ['Mon', 'Wed', 'Fri'], startTime: slot.start, endTime: slot.end,
      instructor: 'TBA', room: slot.room,
      totalSeats: 30, enrolledCount: 0, waitlistCount: 0,
    })),
    ...TTH_SLOTS.map(slot => ({
      courseId, sectionCode: slot.code, type: 'lecture', semester,
      days: ['Tue', 'Thu'], startTime: slot.start, endTime: slot.end,
      instructor: 'TBA', room: slot.room,
      totalSeats: 30, enrolledCount: 0, waitlistCount: 0,
    })),
  ]

  if (hasLab) {
    sections.push({
      courseId, sectionCode: 'LAB01', type: 'lab', semester,
      days: ['Wed'], startTime: '14:30', endTime: '16:20',
      instructor: 'TBA', room: 'Dunn 010',
      totalSeats: 5,   // intentionally small — demos waitlist behaviour
      enrolledCount: 0, waitlistCount: 0,
    })
  }

  return sections
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log('Seeding database...')

  // ── 1. Programs ──────────────────────────────
  console.log('  → Programs')
  const programIdMap: Record<string, string> = {}

  for (const p of programData) {
    const program = await prisma.program.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    })
    programIdMap[p.name] = program.id
  }

  const csId = programIdMap['Computer Science']

  // ── 2. Distribution courses ───────────────────
  // Linked to CS as placeholder — they are shared but Prisma requires a programId
  console.log('  → Distribution courses')
  const courseIdMap: Record<string, string> = {}

  for (const c of distributionCourseData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: { ...c, programId: csId, prerequisites: [], corequisites: [] },
      create: { ...c, programId: csId, prerequisites: [], corequisites: [] },
    })
    courseIdMap[c.code] = course.id
    // cross-listed code maps to the same record
    if ('crossListedCode' in c && c.crossListedCode) {
      courseIdMap[c.crossListedCode] = course.id
    }
  }

  // ── 3. CS courses (prerequisites empty for now) ──
  console.log('  → CS courses')
  for (const c of csCourseData) {
    const { prerequisites, corequisites, ...rest } = c
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: { ...rest, programId: csId, prerequisites: [], corequisites: [] },
      create: { ...rest, programId: csId, prerequisites: [], corequisites: [] },
    })
    courseIdMap[c.code] = course.id
  }

  // ── 4. Resolve prerequisites + corequisites (code → id) then update ──
  // Two-pass: courses are all inserted before we resolve cross-references
  console.log('  → Resolving prerequisites and corequisites')
  for (const c of csCourseData) {
    const hasPrereqs  = c.prerequisites.length > 0
    const hasCoreqs   = c.corequisites.length > 0
    if (!hasPrereqs && !hasCoreqs) continue

    const prereqIds = c.prerequisites.map((code: string) => {
      const id = courseIdMap[code]
      if (!id) throw new Error(`Prerequisite not found in map: "${code}"`)
      return id
    })
    const coreqIds = c.corequisites.map((code: string) => {
      const id = courseIdMap[code]
      if (!id) throw new Error(`Corequisite not found in map: "${code}"`)
      return id
    })

    await prisma.course.update({
      where: { code: c.code },
      data: { prerequisites: prereqIds, corequisites: coreqIds },
    })
  }

  // ── 5. Sections ───────────────────────────────
  console.log('  → Sections')
  const SEED_YEAR  = new Date().getFullYear()
  const FALL_SEM   = `Fall ${SEED_YEAR}`
  const WINTER_SEM = `Winter ${SEED_YEAR + 1}`
  const SEMESTER   = FALL_SEM
  const addMonths  = (n: number) => new Date(Date.now() + n * 30 * 24 * 60 * 60 * 1000)
  const coursesWithLabs = new Set(['COMP 1711', 'COMP 2711', 'STAT 2111'])

  // Wipe all section data and rebuild from scratch on every seed run.
  // This removes stale rows from prior iterations (wrong year, wrong semester filter).
  // Enrollments reference sections — delete them first (no cascade in schema).
  await prisma.enrollment.deleteMany({})
  await prisma.section.deleteMany({})

  const allCourses = await prisma.course.findMany({ select: { id: true, code: true, semestersOffered: true } })

  // Fall pass — only courses offered in Fall
  for (const course of allCourses) {
    if (!course.semestersOffered.includes('Fall')) continue
    const hasLab = coursesWithLabs.has(course.code)
    for (const s of makeSections(course.id, SEMESTER, hasLab)) {
      await prisma.section.upsert({
        where: {
          courseId_sectionCode_semester: {
            courseId: s.courseId,
            sectionCode: s.sectionCode,
            semester: s.semester,
          },
        },
        update: s,
        create: s,
      })
    }
  }

  // Winter pass — only courses offered in Winter
  for (const course of allCourses) {
    if (!course.semestersOffered.includes('Winter')) continue
    const hasLab = coursesWithLabs.has(course.code)
    for (const s of makeSections(course.id, WINTER_SEM, hasLab)) {
      await prisma.section.upsert({
        where: {
          courseId_sectionCode_semester: {
            courseId: s.courseId,
            sectionCode: s.sectionCode,
            semester: s.semester,
          },
        },
        update: s,
        create: s,
      })
    }
  }

  // ── 6. Registration windows ───────────────────
  console.log('  → Registration windows')
  await prisma.registrationWindow.deleteMany({ where: { semester: { notIn: [FALL_SEM, WINTER_SEM] } } })
  await prisma.registrationWindow.upsert({
    where: { semester: FALL_SEM },
    update: { status: 'open', opensAt: new Date(), closesAt: addMonths(3) },
    create: { semester: FALL_SEM, status: 'open', opensAt: new Date(), closesAt: addMonths(3) },
  })
  await prisma.registrationWindow.upsert({
    where: { semester: WINTER_SEM },
    update: { status: 'locked', opensAt: addMonths(6), closesAt: addMonths(7) },
    create: { semester: WINTER_SEM, status: 'locked', opensAt: addMonths(6), closesAt: addMonths(7) },
  })

  if (process.env.SEED_DEMO_STUDENT === 'true') {
    // ── 7. Demo student ───────────────────────────
    console.log('  → Demo student (Alex Johnson)')

    const completedCodes = ['COMP 1711', 'COMP 1721', 'MATH 1211', 'MATH 1221', 'PHIL 1001', 'HIST 1001', 'MUSI 1001']
    const failedCodes    = ['STAT 2111']

    const completedIds = completedCodes.map(code => {
      const id = courseIdMap[code]
      if (!id) throw new Error(`Completed course not in map: "${code}"`)
      return id
    })
    const failedIds = failedCodes.map(code => {
      const id = courseIdMap[code]
      if (!id) throw new Error(`Failed course not in map: "${code}"`)
      return id
    })

    const alex = await prisma.student.upsert({
      where: { email: 'alex.johnson@mta.ca' },
      update: {
        completedCourseIds: completedIds,
        failedCourseIds: failedIds,
        careerTags: ['machine-learning', 'data-science', 'algorithms'],
      },
      create: {
        name: 'Alex Johnson',
        email: 'alex.johnson@mta.ca',
        password: 'password123',   // plaintext — mock only, never do this in production
        programId: csId,
        startYear: 2024,
        currentSemester: 3,        // Year 2 Fall
        standing: 'good',
        careerGoal: 'I want to become a machine learning engineer',
        careerTags: ['machine-learning', 'data-science', 'algorithms'],
        completedCourseIds: completedIds,
        failedCourseIds: failedIds,
        distributionChoices: {},
      },
    })

    // ── 8. Demo enrollments ───────────────────────
    // Enroll Alex in section 001 of each completed course
    console.log('  → Demo enrollments')
    const allSections = await prisma.section.findMany({
      where: { semester: SEMESTER, sectionCode: '001' },
      include: { course: { select: { code: true } } },
    })

    for (const code of completedCodes) {
      const section = allSections.find(s => s.course.code === code)
      if (!section) continue

      await prisma.enrollment.upsert({
        where: { studentId_sectionId: { studentId: alex.id, sectionId: section.id } },
        update: { status: 'enrolled', semester: SEMESTER },
        create: { studentId: alex.id, sectionId: section.id, status: 'enrolled', semester: SEMESTER },
      })

      // Increment enrolledCount to reflect the enrolment
      await prisma.section.update({
        where: { id: section.id },
        data: { enrolledCount: { increment: 1 } },
      })
    }
  }

  console.log('Done. Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
