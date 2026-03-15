# shared/ — Shared TypeScript Types

## What lives here
TypeScript interfaces used by both `frontend/` and `backend/`. This is the only folder that both sides are allowed to import from.

**Rule:** If a type is used in only one place (e.g. only in a component, or only in the engine), keep it local. Only promote to `shared/types/` if it crosses the frontend/backend boundary.

---

## types/index.ts

### `Program`
Represents an academic program (CS, Biology, Business).
- `faculty`: one of `'Science' | 'Social Sciences' | 'Humanities' | 'Arts & Letters'`
- Used in distribution requirement logic — student's home faculty determines what they must fulfill

### `Course`
Core academic unit.
- `code` / `crossListedCode`: a cross-listed course has two department codes (e.g. VMCS 1821 / SPAN 1821)
- `prerequisites`: flat array of course IDs — resolved at seed time, not stored as course codes
- `corequisites`: must register as a bundle — if one fails, both fail
- `offeringFrequency`: `every_semester | every_year | every_two_years` — affects retake delay logic
- `careerTags`: matched against student's career tags by the graph algorithm
- `subjectPrefix`: used by the distribution prefix cap (`PHIL`, `HIST`, `COMP`)

### `Section`
One scheduled instance of a course in a semester.
- `days`: array of `'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'`
- `startTime` / `endTime`: always 24-hour `HH:MM` format
- `enrolledCount` / `totalSeats`: used for live seat count display and availability checks
- `type`: `'lecture' | 'lab' | 'tutorial'` — labs often have only 5 seats (for demo purposes)

### `Student`
The authenticated user.
- `completedCourseIds`: only passed courses — failed courses go to `failedCourseIds`
- `careerTags`: cached after first Claude Haiku call, not re-parsed unless goal changes
- `distributionChoices`: `{ courseId: assignedFaculty }` — manual overrides for cross-listed courses
- `preferences`: see `StudentPreferences`

### `StudentPreferences`
Controls the constraint engine output.
- `noEarlyMornings` + `earlyMorningCutoff`: penalises sections starting before cutoff
- `noFridays`: penalises any section with Friday in its days
- `preferredDays`: rewards sections on these days
- `maxCoursesPerSemester`: caps how many courses the scheduler can include
- `preferCompactSchedule`: rewards fewer unique campus days

### `Enrollment`
A student's registration record for a section.
- `status`: `'enrolled' | 'waitlisted' | 'dropped'`
- Only `'enrolled'` records count toward seat counts and credit totals

### `RegistrationWindow`
Controls when students can register for a semester.
- `status`: `'locked' | 'open' | 'completed'`
- Only `'open'` allows registration — checked both before and inside every transaction

---

## Adding new types

1. Define in `shared/types/index.ts`
2. Export from the same file
3. Import as `import type { Course } from '@/shared/types'`

Do not create separate files per type — keep everything in `index.ts` until the file exceeds ~200 lines.
