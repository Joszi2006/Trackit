# backend/ — Server Logic

## What lives here
All server-side business logic. Pure functions wherever possible (no side effects outside of `registration.ts` and `prisma.ts`). Never imported by browser code.

---

## engine/

The 4-stage pipeline. Stages run in sequence. Each stage takes the output of the previous.

```
buildPrerequisiteGraph()       Stage 1 — ordered course list
        ↓
selectDistributionCourses()    Stage 2 — distribution slots filled
        ↓
generateSchedules()            Stage 3 — 3 conflict-free options
        ↓
registerBundle()               Stage 4 — atomic registration
```

---

### `engine/graph.ts` — Stage 1: DAG + Topological Sort

#### `buildPrerequisiteGraph(courses, completedIds, failedIds, careerTags)`
- Filters out completed courses from the graph
- Builds adjacency list and in-degree map
- Runs Kahn's algorithm (BFS topological sort)
- Assigns each node: `depth` (semesters from now), `careerScore` (tag overlap + out-degree bonus)
- Throws `Error('Circular prerequisite detected')` if cycle found
- Returns `CourseNode[]` sorted by depth ASC, careerScore DESC

#### `handleFailedCourses(graph, failedIds, currentSemester)`
- For each failed course:
  - `every_two_years` → `delayed` (flag on map, no cascade)
  - offered this semester type → `retakable`
  - not offered this semester type → `delayed` with next offering date
- Returns `{ retakable, delayed, unreachable }` (unreachable is always `[]` in practice)

---

### `engine/distribution.ts` — Stage 2: Distribution Requirement Selector

#### `selectDistributionCourses(orderedCourses, studentFaculty, distributionChoices, completedIds, completedCourses)`
- Initialises distribution state for all non-home faculties
- Applies already-completed courses to state first
- Greedily walks `orderedCourses` and assigns each to a distribution slot if:
  - Course is not in home faculty
  - Slot still needs filling (< 2 courses)
  - Subject prefix hasn't hit the cap (< 2 for this category)
- Returns `{ assigned: Course[], distributionState }`

#### `resolveCourseFaculty(course, choices, state, studentFaculty)` *(internal)*
- Manual override from `distributionChoices` takes priority
- Cross-listed: picks whichever faculty slot still needs filling; defaults to primary
- Regular: returns `null` if home faculty

---

### `engine/scheduler.ts` — Stage 3: Interval Scheduling

#### `generateSchedules(bundles, existingEnrollments, preferences, maxCourses)`
- Backtracking search over all section combinations
- Skips any combo that conflicts with selected sections OR existing enrollments
- 10-minute buffer applied between sections (`BUFFER_MINUTES = 10`)
- Required course bundles cannot be skipped; elective bundles can
- Returns `Section[][]` — all valid combinations

#### `scoreSchedule(sections, preferences)`
Scoring rules (additive):
- `-10` per section starting before `earlyMorningCutoff` (if `noEarlyMornings`)
- `-15` per section on Friday (if `noFridays`)
- `+8` per day that matches `preferredDays`
- `+5 × (5 - uniqueDays)` if `preferCompactSchedule`
- `+12` per required course in schedule
- `+6` per distribution course in schedule

#### No valid schedule fallback
Returns `{ schedules: [], canPreview: true, canRegister: false, message, suggestions }` — never crashes, always gives the student actionable suggestions.

---

### `engine/registration.ts` — Stage 4: Bundle Registration

#### `registerBundle(studentId, sectionIds)`
1. Checks registration window is open (hard stop if not)
2. For each section:
   - If course has co-requisites → `registerCoReqBundle()` — both or neither
   - Otherwise → `registerSingle()` in a Prisma transaction
3. On required course failure → stops, reports partial results
4. Returns `{ results, partialFailure, successfulIds }`

#### `registerSingle(studentId, sectionId)` *(Prisma transaction)*
Checks in order inside one atomic transaction:
1. Window still open
2. Seats available
3. Not duplicate enrollment
4. Not already enrolled in a different section of this course
5. Course not already completed
6. Credit total ≤ 18
7. Decrements `enrolledCount`, creates `Enrollment` record

---

## ai/

### `ai/parseGoal.ts`
#### `parseCareerGoal(goal): Promise<string[]>`
- Calls Claude Haiku with the career goal string
- Prompts for 3–6 lowercase hyphenated tags in a JSON array
- On any error (API down, parse failure) → calls `keywordFallback(goal)`
- Result is cached on `Student.careerTags` — only called once unless goal changes

### `ai/fallback.ts`
#### `keywordFallback(goal): string[]`
- Pure function, no network call
- Maps common keywords to predefined tag arrays
- Returns `['general']` if no keyword matches
- **App never breaks without the AI** — this is always the safety net

---

## session.ts
- Exports `sessionOptions` for iron-session: `{ cookieName, password: SESSION_SECRET, cookieOptions }`
- Exports `SessionData` type: `{ studentId: string, isLoggedIn: boolean }`
- Used by both login route and every protected API route

## prisma.ts
- Singleton Prisma client — prevents multiple connections during Next.js hot reload
- Pattern: `globalThis.__prisma ||= new PrismaClient()`
- Only file that imports `@prisma/client` — everything else imports from here

---

## Tests

All engine tests live in `__tests__/engine/`. Stubs already created.

### Before generating tests, review:

**graph.ts**
- [ ] Topological sort order is stable for a known prerequisite chain
- [ ] Completed courses are excluded from the graph, not just filtered in output
- [ ] Career score tiebreaks correctly when depth is equal
- [ ] Circular prereq throws (not silently produces wrong order)

**distribution.ts**
- [ ] Prefix cap: 3 PHIL courses → only 2 count toward Humanities
- [ ] Cross-listed course: VMCS/SPAN assigned to the slot that needs filling, not both
- [ ] Manual override in `distributionChoices` always wins over auto-assign
- [ ] Completed courses are pre-applied to state before new assignments

**scheduler.ts**
- [ ] Two sections on the same day with < 10 min gap → conflict
- [ ] Two sections on different days with any gap → no conflict
- [ ] `scoreSchedule` penalises correctly per preference flag
- [ ] Empty schedule list triggers fallback with suggestions, not crash

**registration.ts**
- [ ] Window check is inside the transaction, not just before it
- [ ] Co-req bundle: if second course fails, first is rolled back
- [ ] `enrolledCount` is incremented atomically — no race condition between check and write

### Testing approach
- Pure functions (graph, distribution, scheduler, scoring): unit tests with constructed mock data
- `registerBundle`: integration test with a real test database (or Prisma mock)
- No mocking of internal engine stages — test them end-to-end as a pipeline
