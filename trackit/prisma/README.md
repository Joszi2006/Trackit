# prisma/ — Database Schema + Seed Data

## What lives here
- `schema.prisma` — Prisma data model (maps to PostgreSQL via Supabase) ✓ written
- `seed.ts` — populates the database with demo data ✓ written

## Schema notes (vs plan)
One addition beyond hackathon-plan-v3.md:
- `Enrollment` has `@@unique([studentId, sectionId])` — enforces no duplicate records at the DB level, not just in code

---

## schema.prisma — Models

### `Program`
3 programs in seed: Computer Science (Science), Biology (Science), Business Administration (Social Sciences).

Key fields:
- `faculty` — determines which distribution categories the student must fulfill
- `totalCredits` — used for graduation progress bar

### `Course`
The most complex model. Key fields to get right:

| Field | Notes |
|-------|-------|
| `prerequisites` | Array of Course IDs — **not course codes**. Resolved at seed time. |
| `corequisites` | Array of Course IDs — must register as a bundle |
| `crossListedCode` | e.g. `"SPAN 1821"` — stored on the VMCS record only |
| `subjectPrefix` | e.g. `"COMP"` — extracted from `code`, used for distribution cap |
| `offeringFrequency` | `every_semester / every_year / every_two_years` |
| `careerTags` | Match against `Student.careerTags` in Stage 1 |
| `semestersOffered` | `["Fall"]`, `["Winter"]`, or `["Fall", "Winter"]` |

### `Section`
Each course has 2–3 sections:
- Morning: MWF 09:30–10:20
- Afternoon: TR 13:00–14:15
- Lab (where applicable): W 14:30–16:20 — **only 5 seats** to demo waitlist behaviour

### `Student`
One demo student: **Alex Johnson**
- Program: Computer Science
- Current semester: 3 (Year 2 Fall)
- Career goal: "I want to become a machine learning engineer"
- Completed (Year 1): COMP 1711, COMP 1721, MATH 1211, MATH 1221, PHIL 1001, HIST 1001, MUSI 1001
- Failed: STAT 2111 (offered every year — retake available this semester)
- Remaining distribution: 1 more Arts & Letters, 2 Social Sciences
- Preferences: no early mornings, prefer TR, max 4 courses, compact schedule
- Registration window: Fall 2025 — **OPEN**

### `Enrollment`
Created atomically during registration. `enrolledCount` on `Section` is incremented in the same transaction.

### `RegistrationWindow`
Seed creates one open window: `Fall 2025 — open`.
Used to demo both preview mode (future semesters, window locked) and registration mode (current semester, window open).

---

## seed.ts — Build order

Seed must run in this order to satisfy foreign key constraints:

```
1. Programs (3)
2. Distribution courses — shared pool (16 courses)
3. CS courses (14) — with prerequisite IDs resolved after insert
4. Sections (2–3 per course, labs = 5 seats)
5. RegistrationWindow (Fall 2025 — open, Winter 2026 — locked)
6. Demo student (Alex Johnson)
7. Demo enrollments (Alex's Year 1 completed courses as Enrollment records)
```

### Prerequisite resolution
Because prerequisites are stored as Course IDs (not codes), the seed script must:
1. Insert all courses first
2. Build a `code → id` map
3. Update each course's `prerequisites` array using the map

---

## Commands

```bash
# Run migration + generate Prisma client
npx prisma migrate dev --name init

# Seed the database
npx prisma db seed

# Open Prisma Studio (visual DB browser)
npx prisma studio

# Reset DB and re-seed (use during development)
npx prisma migrate reset
```

---

## Tests

The schema itself is not unit-tested. Registration logic that touches the DB is tested in `__tests__/api/registration.test.ts` using either:
- A real test database (separate Supabase project or local PostgreSQL)
- Prisma's `$transaction` rollback pattern to keep tests isolated

### Before generating tests, review:
- [x] Does the seed complete without foreign key errors?
- [x] Are Alex's `completedCourseIds` correctly populated (no failed courses in there)?
- [x] Is `STAT 2111` in `failedCourseIds` but NOT in `completedCourseIds`?
- [x] Does the VMCS 1821 / SPAN 1821 cross-listed course appear as ONE record?
- [x] Is Fall 2025 registration window status `"open"` after seed?
- [x] Do labs have `totalSeats: 5`?
