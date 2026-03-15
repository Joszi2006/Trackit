# Hackathon Project Plan v3
## "Trackit" — AI Academic Planner + Mock Self-Service Registration

> "An AI academic planning assistant that uses a graph algorithm to map your
> career goal into a conflict-free, graduation-aware 4-year course plan —
> and registers you automatically, session by session, through a mock
> Self-Service portal."

---

## 1. The One-Sentence Pitch

A student enters their program and career goal. A DAG-based prerequisite
graph maps their entire 4-year academic journey, a constraint engine
generates optimized semester schedules respecting MtA's distribution
requirements, the student reviews and confirms — and the app registers every
section automatically through a mock Self-Service portal, one session at a time.

---

## 2. What Makes This NOT an AI Wrapper

The AI does exactly TWO things. Everything else is systems you built:

| Layer | What it is | AI? |
|---|---|---|
| Mock Self-Service API | Real REST API | No |
| DAG + Topological Sort | Graph algorithm for prereq chains | No |
| Constraint engine | Interval scheduling + preference scoring | No |
| Distribution requirement selector | Set cover greedy algorithm | No |
| Registration system | Atomic transactions, seat counts | No |
| Session management | iron-session encrypted cookies | No |
| Career goal parser | Claude Haiku → career tags, cached | YES — narrow |
| Keyword fallback | If AI fails, app still works | No |
| Schedule explanation | Template strings from data | No |

Remove the AI and you still have a fully working academic planner and
registration system. That is the proof.

---

## 3. Important Architectural Note — Mock vs Real Self-Service

### Mock Self-Service (hackathon)
App has full read + write access. Registers courses, updates transcript,
decrements seat counts. You own the entire system.

### Real Self-Service (future/production)
App is READ-ONLY. It fetches or scrapes transcript data, compares it
against the AI-generated plan, surfaces insights and recommendations — but
NEVER edits the transcript or registers courses on the real portal.
The student still registers manually. The app tells them exactly what to
register and in what order.

This sidesteps every ToS issue and is a cleaner, more honest product.

---

## 4. Locked Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Claude Code knows it deeply, fullstack in one repo |
| Language | TypeScript throughout | Cleaner Claude Code output, catches errors early |
| Database | PostgreSQL via Supabase | Free tier, zero setup, Vercel connects natively |
| ORM | Prisma | Claude Code generates schemas almost perfectly |
| Auth/Session | iron-session | Lightweight, 5 lines to implement mock login |
| Styling | Tailwind CSS | Claude Code is excellent at Tailwind |
| State | Zustand | Simple, Claude Code handles it well |
| AI | Anthropic SDK — Claude Haiku | Cheap, fast, enough for tag extraction |
| Deployment | Vercel | One command, connects to Supabase automatically |

### Monorepo Structure
```
Trackit/
├── app/                        → all pages
├── api/                        → all API routes
├── lib/
│   ├── engine/
│   │   ├── graph.ts            → DAG + topological sort
│   │   ├── distribution.ts     → set cover selector
│   │   ├── scheduler.ts        → interval scheduling + scoring
│   │   └── registration.ts     → bundle registration logic
│   ├── ai/
│   │   ├── parseGoal.ts        → Claude Haiku + fallback
│   │   └── fallback.ts         → keyword matching
│   ├── session.ts              → iron-session config
│   └── prisma.ts               → db client
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── components/                 → shared UI components
```

### Environment Variables
```bash
DATABASE_URL=postgresql://...           # Supabase connection string
DIRECT_URL=postgresql://...             # Supabase direct URL (Prisma needs both)
ANTHROPIC_API_KEY=sk-ant-...
SESSION_SECRET=a-long-random-string-32-chars-min
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Build Responsibilities

### Backend + Algorithms
- Prisma schema + seed data
- DAG graph algorithm (graph.ts)
- Distribution requirement selector (distribution.ts)
- Constraint engine — interval scheduling + scoring (scheduler.ts)
- Registration bundle logic (registration.ts)
- All API routes

### Frontend + AI
- All pages and UI components
- Claude Haiku integration + keyword fallback
- 4-year map visualization
- Schedule review + confirmation flow
- Zustand state management

**Define the API contract before wiring frontend to backend.**

---

## 6. Data Model

```prisma
model Program {
  id           String    @id @default(cuid())
  name         String    // "Computer Science"
  faculty      String    // "Science" | "Social Sciences" | "Humanities" | "Arts & Letters"
  totalCredits Int       // 120
  description  String
  courses      Course[]
  students     Student[]
}

model Course {
  id                String    @id @default(cuid())
  code              String    // "COMP 1711" — primary code
  crossListedCode   String?   // "SPAN 1821" — secondary code if cross-listed
  name              String
  credits           Int       // 3
  programId         String
  program           Program   @relation(fields: [programId], references: [id])
  faculty           String    // "Science" | "Social Sciences" | "Humanities" | "Arts & Letters"
  subjectPrefix     String    // "COMP", "MATH", "PHIL", "SPAN" — for distribution cap
  year              Int       // 1, 2, 3, 4 — typical year
  isRequired        Boolean   // true = core requirement, false = elective or distribution
  prerequisites     String[]  // flat array of course IDs — resolved at seed time
  corequisites      String[]  // must register as a bundle
  semestersOffered  String[]  // ["Fall"] | ["Winter"] | ["Fall", "Winter"]
  offeringFrequency String    // "every_semester" | "every_year" | "every_two_years"
  lastOfferedYear   Int?      // for every_two_years courses
  careerTags        String[]  // ["machine-learning", "data-science"]
  minYearStanding   Int       @default(1)
  programRestricted Boolean   @default(false)
  description       String
  sections          Section[]
}

model Section {
  id            String       @id @default(cuid())
  courseId      String
  course        Course       @relation(fields: [courseId], references: [id])
  sectionCode   String       // "001", "LAB01", "TUT01"
  type          String       // "lecture" | "lab" | "tutorial"
  semester      String       // "Fall 2025"
  days          String[]     // ["Mon", "Wed", "Fri"]
  startTime     String       // "09:30" — always HH:MM 24hr
  endTime       String       // "10:20"
  instructor    String       @default("TBA")
  room          String
  totalSeats    Int
  enrolledCount Int          @default(0)
  waitlistCount Int          @default(0)
  enrollments   Enrollment[]
}

model Student {
  id                   String       @id @default(cuid())
  name                 String
  email                String       @unique
  password             String       // hashed, mock only
  programId            String
  program              Program      @relation(fields: [programId], references: [id])
  startYear            Int          // 2024
  currentSemester      Int          // 1-8
  standing             String       @default("good") // "good" | "probation"
  careerGoal           String?
  careerTags           String[]     // parsed from careerGoal, cached after first run
  preferences          Json
  completedCourseIds   String[]     // passed courses only — failed courses NOT included
  failedCourseIds      String[]     // failed courses — still need to retake
  distributionChoices  Json         // { courseId: "assigned faculty category" }
  enrollments          Enrollment[]
}

model Enrollment {
  id           String   @id @default(cuid())
  studentId    String
  student      Student  @relation(fields: [studentId], references: [id])
  sectionId    String
  section      Section  @relation(fields: [sectionId], references: [id])
  status       String   // "enrolled" | "waitlisted" | "dropped"
  registeredAt DateTime @default(now())
  semester     String   // "Fall 2025"
}

model RegistrationWindow {
  id        String   @id @default(cuid())
  semester  String   @unique  // "Fall 2025"
  status    String   // "locked" | "open" | "completed"
  opensAt   DateTime
  closesAt  DateTime
}
```

### Preferences Object
```json
{
  "noEarlyMornings": true,
  "earlyMorningCutoff": "09:00",
  "noFridays": false,
  "maxCoursesPerSemester": 4,
  "minCoursesPerSemester": 3,
  "preferredDays": ["Tue", "Thu"],
  "blockedSlots": [],
  "preferCompactSchedule": true,
  "courseLoadPreference": "balanced"
}
```

### Distribution Choices Object
```json
{
  "courseId_abc123": "Humanities",
  "courseId_def456": "Arts & Letters"
}
```
Stores which faculty category a cross-listed course has been manually
assigned to by the student. Engine respects this choice when calculating
distribution progress.

---

## 7. MtA Distribution Requirements

Every student must complete **2 courses from each faculty they are NOT home in.**
No more than **2 courses sharing the same subject prefix** can count toward
any distribution category.

| Program Faculty | Must fulfill |
|---|---|
| Science | 2 × Humanities, 2 × Arts & Letters, 2 × Social Sciences |
| Social Sciences | 2 × Humanities, 2 × Arts & Letters, 2 × Science |
| Humanities | 2 × Arts & Letters, 2 × Social Sciences, 2 × Science |
| Arts & Letters | 2 × Humanities, 2 × Social Sciences, 2 × Science |

### Subject Prefix Cap
```
PHIL 1001 + PHIL 2001 → only 2 count toward Humanities (cap reached)
PHIL 1001 + HIST 1001 → both count toward Humanities (different prefixes, fine)
PHIL 1001 + HIST 1001 + ENGL 1001 → all 3 count toward Humanities (each prefix ≤ 2)
```

### Cross-Listed Courses
One physical course, two department codes (e.g. VMCS 1821 / SPAN 1821).
- Stored as ONE record in the database with `code` + `crossListedCode`
- Counts toward distribution for ONE faculty only — student chooses which
- Engine auto-assigns to whichever faculty slot still needs filling
- Student can manually override via `distributionChoices` on their profile
- In mock: app writes the override. In real: app only recommends, never writes

---

## 8. The Algorithm Pipeline

This is the heart of the product. Four stages run in sequence:

```
Stage 1: DAG + Topological Sort
         ↓ ordered, unlocked, career-weighted course list
Stage 2: Distribution Requirement Selector
         ↓ distribution slots filled optimally
Stage 3: Constraint Engine (Interval Scheduling + Scoring)
         ↓ 3 conflict-free, preference-scored schedule options
Stage 4: Registration System
         ↓ confirmed schedule registered atomically
```

---

## 9. Stage 1 — DAG + Topological Sort

### Why a Graph
Prerequisite chains are a directed acyclic graph (DAG). Topological sort
gives the valid ordering of all courses — you can never take a course before
its prerequisites are met. It also reveals:
- Which courses are unlocked right now
- Which courses unlock the most future paths (high out-degree = prioritize)
- How many semesters deep a student is from any target course
- Which nodes become unreachable when a course is failed

### Kahn's Algorithm Implementation
```typescript
// lib/engine/graph.ts

interface CourseNode {
  course: Course
  unlocks: string[]   // course IDs this unlocks
  depth: number       // semesters from now to reach this course
  careerScore: number // tag overlap with student career tags
}

export function buildPrerequisiteGraph(
  courses: Course[],
  completedIds: string[],
  failedIds: string[],
  careerTags: string[]
): CourseNode[] {

  // Remove completed courses from graph
  const remaining = courses.filter(c => !completedIds.includes(c.id))

  const inDegree = new Map<string, number>()
  const adjList = new Map<string, string[]>()

  for (const course of remaining) {
    // Only count prerequisites that are NOT yet completed
    const pendingPrereqs = course.prerequisites.filter(
      p => !completedIds.includes(p)
    )
    inDegree.set(course.id, pendingPrereqs.length)

    for (const prereqId of pendingPrereqs) {
      if (!adjList.has(prereqId)) adjList.set(prereqId, [])
      adjList.get(prereqId)!.push(course.id)
    }
  }

  // Kahn's algorithm
  const queue = remaining.filter(c => inDegree.get(c.id) === 0)
  const sorted: CourseNode[] = []
  let depth = 0

  while (queue.length > 0) {
    const levelSize = queue.length
    for (let i = 0; i < levelSize; i++) {
      const course = queue.shift()!

      // Career score = how many tags overlap with student goal
      const careerScore = course.careerTags.filter(
        t => careerTags.includes(t)
      ).length

      // Out-degree bonus — courses that unlock more paths are prioritized
      const outDegree = adjList.get(course.id)?.length || 0

      sorted.push({
        course,
        unlocks: adjList.get(course.id) || [],
        depth,
        careerScore: careerScore + outDegree * 0.5
      })

      for (const neighborId of adjList.get(course.id) || []) {
        inDegree.set(neighborId, inDegree.get(neighborId)! - 1)
        if (inDegree.get(neighborId) === 0) {
          queue.push(remaining.find(c => c.id === neighborId)!)
        }
      }
    }
    depth++
  }

  // Cycle detection — if sorted length < remaining, there's a circular prereq
  if (sorted.length < remaining.length) {
    throw new Error('Circular prerequisite detected in course data')
  }

  // Sort within same depth by career score descending
  return sorted.sort((a, b) =>
    a.depth !== b.depth ? a.depth - b.depth : b.careerScore - a.careerScore
  )
}
```

### Failed Course Handling in the Graph
```typescript
export function handleFailedCourses(
  graph: CourseNode[],
  failedIds: string[],
  currentSemester: string
): { retakable: Course[], delayed: Course[], unreachable: Course[] } {

  const retakable = []
  const delayed = []

  for (const node of graph) {
    if (!failedIds.includes(node.course.id)) continue

    const semType = getSemesterType(currentSemester) // "Fall" | "Winter"
    const nextOffering = getNextOffering(node.course, currentSemester)

    if (node.course.offeringFrequency === 'every_two_years') {
      // Does NOT cascade — just delayed, flag on the map
      delayed.push({ ...node.course, nextOffering })
    } else if (node.course.semestersOffered.includes(semType)) {
      retakable.push(node.course) // available next open session
    } else {
      // Offered but not this semester type — wait for next one
      delayed.push({ ...node.course, nextOffering })
    }
  }

  return { retakable, delayed, unreachable: [] }
  // Note: every_two_years courses rarely have dependents so
  // unreachable list stays empty in practice
}
```

---

## 10. Stage 2 — Distribution Requirement Selector

Runs after the graph produces an ordered course list. Fills distribution
slots greedily, respecting the prefix cap and student's manual overrides.

```typescript
// lib/engine/distribution.ts

interface DistributionState {
  [faculty: string]: {
    count: number          // total courses assigned so far
    prefixes: Map<string, number> // prefix → count for this category
  }
}

export function selectDistributionCourses(
  orderedCourses: CourseNode[],
  studentFaculty: string,
  distributionChoices: Record<string, string>, // manual overrides
  completedIds: string[],
  completedCourses: Course[]
): { assigned: Course[], distributionState: DistributionState } {

  const REQUIRED_PER_CATEGORY = 2
  const MAX_PER_PREFIX = 2

  // All faculties except student's home faculty
  const requiredFaculties = ['Humanities', 'Arts & Letters', 'Social Sciences', 'Science']
    .filter(f => f !== studentFaculty)

  // Initialize state — count courses already completed toward distribution
  const state: DistributionState = {}
  for (const faculty of requiredFaculties) {
    state[faculty] = { count: 0, prefixes: new Map() }
  }

  // Apply completed courses to distribution state first
  for (const course of completedCourses) {
    applyToDistribution(course, distributionChoices, state, studentFaculty)
  }

  const assigned = []

  // Greedily assign from ordered course list
  for (const node of orderedCourses) {
    const course = node.course
    if (completedIds.includes(course.id)) continue

    const targetFaculty = resolveCourseFaculty(course, distributionChoices, state, studentFaculty)
    if (!targetFaculty) continue // home faculty or no slot available

    const categoryState = state[targetFaculty]
    if (categoryState.count >= REQUIRED_PER_CATEGORY) continue

    const prefixCount = categoryState.prefixes.get(course.subjectPrefix) || 0
    if (prefixCount >= MAX_PER_PREFIX) continue

    // Assign this course to fill the distribution slot
    categoryState.count++
    categoryState.prefixes.set(course.subjectPrefix, prefixCount + 1)
    assigned.push(course)
  }

  return { assigned, distributionState: state }
}

function resolveCourseFaculty(
  course: Course,
  choices: Record<string, string>,
  state: DistributionState,
  studentFaculty: string
): string | null {

  // Manual override takes priority
  if (choices[course.id]) return choices[course.id]

  // Cross-listed: pick whichever slot still needs filling
  if (course.crossListedCode) {
    const primaryFaculty = course.faculty
    const crossFaculty = getCrossListedFaculty(course.crossListedCode)

    const primaryNeedsMore = state[primaryFaculty]?.count < 2
    const crossNeedsMore = state[crossFaculty]?.count < 2

    if (primaryNeedsMore && !crossNeedsMore) return primaryFaculty
    if (crossNeedsMore && !primaryNeedsMore) return crossFaculty
    if (primaryNeedsMore && crossNeedsMore) return primaryFaculty // default to primary
    return null
  }

  // Regular course — only counts if not home faculty
  if (course.faculty === studentFaculty) return null
  return course.faculty
}
```

---

## 11. Stage 3 — Constraint Engine (Interval Scheduling)

Runs after distribution selector produces the full recommended course list
for the semester. Generates valid, conflict-free, preference-scored schedules.

### Time Conflict with 10-Minute Buffer
```typescript
// lib/engine/scheduler.ts

const BUFFER_MINUTES = 10

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function hasConflict(a: Section, b: Section): boolean {
  if (!a.days.some(d => b.days.includes(d))) return false

  const aStart = toMinutes(a.startTime)
  const aEnd   = toMinutes(a.endTime) + BUFFER_MINUTES
  const bStart = toMinutes(b.startTime)
  const bEnd   = toMinutes(b.endTime) + BUFFER_MINUTES

  return aStart < bEnd && bStart < aEnd
  // 11:30 end + 10min buffer = 11:40
  // anything starting before 11:40 is a conflict
}
```

### Branch-and-Bound Combination Generator
```typescript
function generateSchedules(
  bundles: CourseBundle[],
  existingEnrollments: Section[],
  preferences: Preferences,
  maxCourses: number
): Section[][] {

  const results: Section[][] = []

  function backtrack(index: number, current: Section[]) {
    if (index === bundles.length) {
      if (current.length > 0) results.push([...current])
      return
    }

    const bundle = bundles[index]
    const sectionCombos = getCartesianProduct(bundle.map(b => b.sections))

    for (const combo of sectionCombos) {
      // Check against already-selected AND existing enrollments
      const allExisting = [...current, ...existingEnrollments]
      const conflicts = combo.some(s => allExisting.some(e => hasConflict(s, e)))
      if (conflicts) continue

      combo.forEach(s => current.push(s))
      backtrack(index + 1, current)
      combo.forEach(() => current.pop())
    }

    // Skip elective bundles (not required courses)
    if (!bundle[0].course.isRequired) {
      backtrack(index + 1, current)
    }
  }

  backtrack(0, [])
  return results
}
```

### Scoring
```typescript
function scoreSchedule(sections: Section[], preferences: Preferences): number {
  let score = 0
  const cutoff = toMinutes(preferences.earlyMorningCutoff || '09:00')

  for (const s of sections) {
    if (preferences.noEarlyMornings && toMinutes(s.startTime) < cutoff) score -= 10
    if (preferences.noFridays && s.days.includes('Fri')) score -= 15
    const preferredMatches = s.days.filter(d => preferences.preferredDays?.includes(d)).length
    score += preferredMatches * 8
  }

  const uniqueDays = new Set(sections.flatMap(s => s.days)).size
  if (preferences.preferCompactSchedule) score += (5 - uniqueDays) * 5

  // Required course priority
  const requiredCount = sections.filter(s => s.course?.isRequired).length
  score += requiredCount * 12

  // Distribution progress bonus
  const distributionCount = sections.filter(s => s.course?.faculty !== 'home').length
  score += distributionCount * 6

  return score
}
```

### No Valid Schedule Handling
```typescript
if (validSchedules.length === 0) {
  return {
    schedules: [],
    canPreview: true,   // student can still see what it would look like
    canRegister: false,
    message: 'No conflict-free schedule found with your current preferences.',
    suggestions: [
      preferences.noFridays
        ? 'COMP 3711 is only available on Fridays this semester'
        : null,
      'Try reducing max courses from 4 to 3',
      'Consider allowing morning classes — earliest available is 08:30',
    ].filter(Boolean)
  }
}
```

---

## 12. Stage 4 — Registration System

### Session-by-Session Rule
- Students register ONE semester at a time
- Can PREVIEW future semester schedules anytime (constraint engine runs, no registration)
- Can only REGISTER when that semester's window status is "open"
- Cannot register for Fall 2026 even if schedule is generated — window must be open

```typescript
// api/registration-window/[semester]/route.ts
export async function GET(req, { params }) {
  const window = await prisma.registrationWindow.findUnique({
    where: { semester: params.semester }
  })
  return Response.json({
    semester: params.semester,
    status: window?.status || 'locked',
    opensAt: window?.opensAt,
    closesAt: window?.closesAt,
    canRegister: window?.status === 'open'
  })
}
```

### Bundle Registration with Atomicity
```typescript
// lib/engine/registration.ts

export async function registerBundle(studentId: string, sectionIds: string[]) {
  // Check window FIRST before touching anything
  const semester = await getSemesterForSections(sectionIds)
  const window = await prisma.registrationWindow.findUnique({
    where: { semester }
  })

  if (window?.status !== 'open') {
    return {
      success: false,
      error: 'WINDOW_CLOSED',
      message: 'Registration window is not currently open for this semester'
    }
  }

  const results = []

  for (const sectionId of sectionIds) {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true }
    })

    // Co-req bundle: register atomically or not at all
    if (section.course.corequisites.length > 0) {
      const bundleResult = await registerCoReqBundle(studentId, section, sectionIds)
      results.push(bundleResult)
      if (!bundleResult.success) {
        // Required bundle failed — stop and report
        return {
          results,
          partialFailure: true,
          message: `Co-requisite bundle failed: ${bundleResult.error}`,
          successfulIds: results.filter(r => r.success).map(r => r.sectionId)
        }
      }
      continue
    }

    const result = await registerSingle(studentId, sectionId)
    results.push({ sectionId, ...result })

    if (!result.success && section.course.isRequired) {
      return {
        results,
        partialFailure: true,
        message: `Required course registration failed. Review your options.`,
        successfulIds: results.filter(r => r.success).map(r => r.sectionId)
      }
    }
  }

  return { results, partialFailure: false }
}
```

### Single Section — Atomic Transaction
```typescript
async function registerSingle(studentId: string, sectionId: string) {
  return await prisma.$transaction(async (tx) => {
    const section = await tx.section.findUnique({ where: { id: sectionId } })

    // 1. Re-check window inside transaction
    const window = await tx.registrationWindow.findUnique({
      where: { semester: section.semester }
    })
    if (window?.status !== 'open') return { success: false, error: 'WINDOW_CLOSED' }

    // 2. Seat availability
    if (section.enrolledCount >= section.totalSeats) {
      return { success: false, error: 'SECTION_FULL' }
    }

    // 3. Duplicate enrollment
    const existing = await tx.enrollment.findFirst({
      where: { studentId, sectionId, status: 'enrolled' }
    })
    if (existing) return { success: false, error: 'ALREADY_ENROLLED' }

    // 4. Already enrolled in this course (different section)
    const courseEnrolled = await tx.enrollment.findFirst({
      where: {
        studentId,
        section: { courseId: section.courseId },
        status: 'enrolled'
      }
    })
    if (courseEnrolled) return { success: false, error: 'COURSE_ALREADY_REGISTERED' }

    // 5. Already completed this course
    const student = await tx.student.findUnique({ where: { id: studentId } })
    if (student.completedCourseIds.includes(section.courseId)) {
      return { success: false, error: 'COURSE_ALREADY_COMPLETED' }
    }

    // 6. Credit overload check (max 18 credits per semester)
    const currentCredits = await getCurrentSemesterCredits(tx, studentId, section.semester)
    if (currentCredits + section.course.credits > 18) {
      return { success: false, error: 'CREDIT_OVERLOAD' }
    }

    // 7. Decrement seat + create enrollment
    await tx.section.update({
      where: { id: sectionId },
      data: { enrolledCount: { increment: 1 } }
    })

    const enrollment = await tx.enrollment.create({
      data: { studentId, sectionId, status: 'enrolled', semester: section.semester }
    })

    return { success: true, enrollment }
  })
}
```

---

## 13. Edge Cases — Complete List

### Must Handle (demo breaks without these)

| Edge Case | Where handled | Policy |
|---|---|---|
| Partial registration failure | registerBundle | Keep successes, report failures, suggest alternatives |
| Co-req bundle atomicity | registerCoReqBundle | Both register or neither does |
| Seat fills between review + confirm | Transaction re-validates | Stale UI is fine, transaction catches it |
| Registration window closes mid-flow | Re-checked at bundle start AND inside transaction | Hard stop, clear error |
| Course not offered this semester | Stage 1 graph pool filter | Never reaches schedule options |
| Duplicate enrollment | Transaction check | ALREADY_ENROLLED error |
| Already completed course | Transaction check | COURSE_ALREADY_COMPLETED error |
| Same course, two sections | Transaction check | COURSE_ALREADY_REGISTERED error |
| Distribution prefix cap (max 2 per subject) | Stage 2 distribution selector | Greedy skip if prefix cap reached |
| Cross-listed course double-counting | resolveCourseFaculty | One faculty only, auto or manual |
| Failed course retake priority | Stage 1 graph — failedIds injected | Retake slot prioritized in next open session |
| Every-two-years course delay | handleFailedCourses | Flag on map, no cascade |
| No valid schedule exists | Scheduler fallback | Return suggestions, never empty crash |
| Credit overload | Transaction check | CREDIT_OVERLOAD error, warn before confirm |

### Nice to Have

| Edge Case | Policy |
|---|---|
| Co-req drop cascade | Warn student, require explicit confirm to drop both |
| Year standing restriction | minYearStanding on Course, checked in graph pool |
| Live seat count staleness | Poll every 30 seconds on review screen |
| 4-year map disrupted by failure | Flag affected semesters as "needs replanning" |

### Skip for Hackathon

- Academic probation course limits
- Waitlist cascade auto-enrolment
- Major/program restricted sections
- Real password hashing
- Multiple programs per student

---

## 14. AI Layer — Minimal and Resilient

### Use 1 — Career Goal Parsing (Claude Haiku)
One call. Cached on Student record. Never called again unless goal changes.

```typescript
// lib/ai/parseGoal.ts
export async function parseCareerGoal(goal: string): Promise<string[]> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Extract 3-6 academic career domain tags from this goal.
Return ONLY a JSON array of lowercase hyphenated strings.
No markdown, no explanation, just the array.
Goal: "${goal}"
Example: ["machine-learning","data-science","algorithms"]`
      }]
    })
    return JSON.parse(response.content[0].text)
  } catch {
    return keywordFallback(goal) // app never breaks
  }
}
```

### Keyword Fallback (Always Works)
```typescript
// lib/ai/fallback.ts
export function keywordFallback(goal: string): string[] {
  const tagMap: Record<string, string[]> = {
    'machine learning': ['machine-learning', 'data-science', 'algorithms'],
    'software engineer': ['fullstack', 'backend', 'systems'],
    'data scientist':    ['machine-learning', 'statistics', 'data-science'],
    'web developer':     ['frontend', 'backend', 'fullstack'],
    'doctor':            ['biology', 'chemistry', 'health-sciences'],
    'nurse':             ['biology', 'anatomy', 'health-sciences'],
    'lawyer':            ['political-science', 'ethics', 'writing'],
    'accountant':        ['accounting', 'finance', 'economics'],
    'researcher':        ['statistics', 'writing', 'methodology'],
    'biologist':         ['biology', 'chemistry', 'research'],
    'artist':            ['fine-arts', 'design', 'visual-culture'],
    'musician':          ['music', 'performance', 'theory'],
  }
  const lower = goal.toLowerCase()
  for (const [keyword, tags] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) return tags
  }
  return ['general']
}
```

### Schedule Explanation — No AI Needed
```typescript
function explainSchedule(schedule: Section[], student: Student): string {
  const days = [...new Set(schedule.flatMap(s => s.days))].join('/')
  const earliest = Math.min(...schedule.map(s => toMinutes(s.startTime)))
  const credits = schedule.reduce((sum, s) => sum + s.course.credits, 0)
  const required = schedule.filter(s => s.course.isRequired).length
  const distribution = schedule.filter(s => s.course.faculty !== student.program.faculty).length

  return `${schedule.length} courses · ${credits} credits · 
  ${required} required · ${distribution} distribution · 
  Campus days: ${days} · Earliest: ${minutesToTime(earliest)}`
}
```

---

## 15. Pages + UI Flow

### `/login`
Mock login. Student ID + any password. Sets iron-session.

### `/onboarding` (first visit only)
1. Select program
2. Enter career goal → Claude Haiku parses → tags cached on Student
3. Set preferences (toggle cards)
→ Generates 4-year map → redirect to dashboard

### `/dashboard`
- 4-year timeline map (Year 1 → 4)
  - Completed semesters: green, shows courses taken
  - Current semester: active, shows enrolled + available
  - Future semesters: preview mode, shows planned courses
  - Failed courses: flagged in red, retake scheduled in next slot
  - Every-two-year delays: flagged with next offering year
- Graduation progress bar
- Distribution requirements tracker (per category, shows prefix usage)
- Registration window banner: "Fall 2025 open" / "Winter 2026 opens Jan 10"
- CTA "Plan this semester" — active only when window is open

### `/plan/:semester`
- Shows 3 generated schedule options
- Each option has:
  - Weekly calendar grid
  - Score breakdown
  - Distribution slots it fills
  - Live seat counts (polling every 30s)
- Preview badge if window is not open ("Registration opens Jan 10")
- "Confirm & Register All" only active when window is open
- Post-registration: results screen — what succeeded, what failed, what to do

### `/self-service`
Institutional portal aesthetic — looks like MtA Self-Service.
- Current confirmed schedule
- Full transcript (completed + in-progress)
- Degree audit by year and distribution category
- Updates live after registration fires
- This is what judges see as proof the registration actually worked

---

## 16. Seed Data

### Programs (3)
| Program | Faculty |
|---|---|
| Computer Science | Science |
| Biology | Science |
| Business Administration | Social Sciences |

### Distribution Course Pool (shared across programs)
Minimum 4 courses per distribution category, mix of prefixes:
- Humanities: PHIL 1001, HIST 1001, ENGL 1021, RELI 1001
- Arts & Letters: MUSI 1001, FINA 1001, DRAM 1001, VMCS 1821/SPAN 1821 (cross-listed)
- Social Sciences: ECON 1001, SOCI 1001, PSYC 1001, POLS 1001
- Science (for non-science programs): PHYS 1001, CHEM 1001, BIOL 1001, ENVS 1001

### CS Courses (~20)
Year 1: COMP 1711, COMP 1721, MATH 1211, MATH 1221
Year 2: COMP 2711 (prereq: COMP 1721), COMP 2721, COMP 2731, STAT 2111
Year 3: COMP 3711 (prereq: COMP 2711), COMP 3721, COMP 3731 (every_two_years)
Year 4: COMP 4711 (prereq: COMP 3711), COMP 4721, COMP 4731

### Sections per course (2-3)
- Morning: MWF 09:30–10:20
- Afternoon: TR 13:00–14:15
- Lab where applicable: W 14:30–16:20 (5 seats to demo waitlist)

### Demo Student
- Name: Alex Johnson
- Program: Computer Science
- Current semester: 3 (Year 2 Fall)
- Career goal: "I want to become a machine learning engineer"
- Completed (Year 1): COMP 1711, COMP 1721, MATH 1211, MATH 1221,
  PHIL 1001 (Humanities ✓1), HIST 1001 (Humanities ✓2), MUSI 1001 (Arts ✓1)
- Failed: STAT 2111 (offered every year — retake available this semester)
- Remaining distribution: 1 more Arts & Letters, 2 Social Sciences
- Preferences: no 8am, prefer TR, max 4 courses, compact schedule
- Registration window: Fall 2025 — OPEN

---

## 17. Build Order

### Phase 1 — Foundation

1. `npx create-next-app@latest Trackit --typescript --tailwind --app`
2. `npm install prisma @prisma/client iron-session @anthropic-ai/sdk zustand`
3. Write schema.prisma
4. Write seed.ts
5. `npx prisma migrate dev && npx prisma db seed`
6. Set up Zustand store
7. Build `/login` + iron-session POST `/api/auth/login`
8. Build `/onboarding` (static, no API yet)
9. Set up routing + layout
10. Expose `GET /api/courses` and `GET /api/student/:id`

**Checkpoint:** Hit the endpoints, confirm data renders in UI.

### Phase 2 — Core Algorithms

1. graph.ts — DAG + topological sort + failed course handling
2. distribution.ts — set cover selector with prefix cap + cross-listed logic
3. scheduler.ts — interval scheduling + branch-and-bound + scoring
4. registration.ts — bundle registration + atomic transactions
5. POST `/api/plan/generate`
6. POST `/api/register/bundle`
7. GET `/api/student/:id/degree-audit`
8. `/plan/:semester` — schedule cards + weekly grid
9. Claude Haiku career goal parser + keyword fallback
10. 4-year map visualization on dashboard
11. Registration confirmation + results screen

### Phase 3 — Polish

1. Wire career goal parser to onboarding
2. Wire degree audit + distribution tracker to dashboard
3. Build `/self-service` page (institutional aesthetic)
4. Live seat count polling on plan page
5. Full end-to-end test: login → onboard → plan → confirm → self-service updated
6. Test failed course + retake flow
7. Test cross-listed course distribution assignment

### Phase 4 — Demo Prep (~30 min)
1. Reset demo student to pre-registration state
2. Run full demo clean
3. Confirm seat decrements, distribution updates, transcript reflects enrollment

---

## 18. Demo Script (2 minutes)

1. "This is Trackit. Let me show you the full flow."
2. Log in as Alex Johnson — Year 2 CS student, goal: ML engineer.
3. Show dashboard. 4-year map visible. Required courses, career-weighted
   electives, distribution slots mapped across all 8 semesters.
   "Notice STAT 2111 is flagged — Alex failed it last semester.
   The graph replanned it into this semester automatically."
4. Show distribution tracker. "MtA requires courses outside your faculty.
   Alex still needs 1 Arts & Letters and 2 Social Sciences."
5. Registration window is open for Fall 2025. Click "Plan this semester."
6. Three options appear. "Our DAG ran topological sort on 60 courses,
   filtered by prerequisites, distribution needs, and Alex's preferences.
   No 8am, compact Tuesday/Thursday schedule, no conflicts."
7. Point out VMCS 1821/SPAN 1821. "Cross-listed course — the engine
   assigned it to Arts & Letters since that slot needs filling."
8. Pick option 1. Click "Confirm & Register All."
9. Results screen: all sections enrolled. Seat counts drop live.
10. Switch to Self-Service. Schedule updated. Distribution tracker updated.
    Degree audit ticked forward.
11. "From career goal to confirmed enrollment, prerequisites checked,
    distribution requirements tracked, graph-optimized — that's Trackit."

---

## 19. What NOT to Build

- OAuth or real password hashing
- Email / push notifications
- Mobile responsive layout
- Waitlist cascade auto-enrolment
- Academic probation restrictions
- More than 3 programs
- Internship or extracurricular tracking
- Real MtA API connection

---

## 20. Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Graph cycle in seed data | Low | Kahn's throws on cycle — caught at seed time |
| Constraint engine too slow | Medium | Cap at 5 courses, prune branches early |
| Distribution selector misassigns cross-listed | Medium | Test VMCS/SPAN case specifically in Phase 3 |
| Anthropic API down during demo | Low | Keyword fallback always returns tags |
| Supabase connection issue | Low | Both devs test connection end of Phase 1 |
| Window check race condition | Low | Re-checked inside transaction |
| Scope creep | High | This document is law. No new features after Phase 1 sync |
