# frontend/ — UI Layer

## What lives here
All React components, custom hooks, and Zustand state. Nothing in this folder runs on the server. No direct database calls. No imports from `backend/`.

Allowed imports:
- `@/shared/types/*` — TypeScript types
- `@/frontend/*` — other frontend files
- Standard React, Next.js client hooks

---

## components/

### `components/ui/` — Base primitives
Reusable, unstyled-ish building blocks. Built with Tailwind.

| Component | Purpose |
|-----------|---------|
| `Button` | Primary / secondary / destructive variants |
| `Card` | Container with border + padding |
| `Badge` | Status chips (open, locked, completed, failed) |
| `Input` | Text input with label and error state |
| `Spinner` | Loading indicator |

### `components/dashboard/`

| Component | Purpose |
|-----------|---------|
| `FourYearMap` | Grid of 8 semesters. Completed = green, current = active, future = preview, failed = red, every-two-year delay = flagged |
| `DistributionTracker` | Shows progress per distribution category with prefix usage |
| `RegistrationBanner` | "Fall 2025 open" / "Winter 2026 opens Jan 10" — CTA to `/plan/semester` |
| `GraduationProgress` | Progress bar toward total required credits |

### `components/plan/`

| Component | Purpose |
|-----------|---------|
| `ScheduleCard` | One schedule option — score, courses, distribution slots filled |
| `WeeklyGrid` | Mon–Fri time grid showing section blocks |
| `SeatCount` | Live seat count badge — polls every 30s |
| `RegistrationResult` | Post-registration — what enrolled, what failed, what to do next |

### `components/self-service/`

| Component | Purpose |
|-----------|---------|
| `Transcript` | Full course history by year, grade, status |
| `DegreeAudit` | Requirements checklist — year by year + distribution categories |
| `CurrentSchedule` | This semester's enrolled sections in a readable list |

---

## hooks/

### `useStudent.ts`
- Fetches `GET /api/student/:id` on mount
- Returns `{ student, loading, error }`
- Caches in Zustand — doesn't refetch unless invalidated

### `usePlan.ts`
- Calls `POST /api/plan/generate` with `{ studentId, semester }`
- Returns `{ schedules, loading, canRegister, message, suggestions }`
- Holds selected schedule index
- Exposes `selectSchedule(index)` and `clearPlan()`

### `useRegistration.ts`
- Calls `POST /api/register/bundle` with `{ studentId, sectionIds }`
- Returns `{ results, loading, partialFailure, successfulIds }`
- Invalidates student cache in Zustand on success so dashboard refreshes

---

## store/index.ts — Zustand

Single global store. Slices:

```
{
  studentId: string | null           // set on login
  student: Student | null            // cached from useStudent
  careerTags: string[]               // parsed from careerGoal
  selectedSchedule: Section[] | null // confirmed schedule before registration
  registrationResults: RegistrationResult | null

  // actions
  setStudent(student)
  setCareerTags(tags)
  selectSchedule(sections)
  setRegistrationResults(results)
  clearSession()                     // called on logout
}
```

---

## Tests

Frontend tests live in `__tests__/frontend/` (not created yet — review first).

### Before generating tests, review:
- [ ] `useStudent` — does it correctly handle loading / error / cached states?
- [ ] `usePlan` — does it expose `canRegister: false` correctly when window is closed?
- [ ] `useRegistration` — does it invalidate Zustand cache after success?
- [ ] `FourYearMap` — does it render failed courses in red and delayed courses with a flag?
- [ ] `SeatCount` — does the 30s polling start and stop correctly?
- [ ] `RegistrationResult` — does it show partial failure details clearly?

### Testing approach
- Hooks: use `renderHook` from `@testing-library/react` with mocked `fetch`
- Components: use `@testing-library/react` render + assertions on DOM output
- No snapshot tests — they break too easily with Tailwind changes
