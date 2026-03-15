# mock-self-service/ — Simulated MtA Self-Service Portal

## What this is

This folder simulates Mount Allison University's Self-Service portal for the hackathon.

In the **real world**:
- Trackit is read-only against MtA's portal
- Trackit fetches/scrapes transcript and schedule data
- Students still register manually — Trackit only tells them what to register and in what order

In the **hackathon**:
- This mock has full read + write access to the database
- It simulates what MtA's API would look like if it existed
- Trackit calls these endpoints exactly as it would call the real MtA API

**To go to production:** replace these endpoints with real MtA API calls. Nothing else in Trackit changes.

---

## Endpoints

### `GET /api/mta/transcript/:studentId`
Returns the student's full academic history.

**Response shape:**
```json
{
  "studentId": "...",
  "name": "Alex Johnson",
  "program": "Computer Science",
  "standing": "good",
  "completedCourses": [
    { "code": "COMP 1711", "name": "...", "credits": 3, "grade": "A", "semester": "Fall 2023" }
  ],
  "failedCourses": [
    { "code": "STAT 2111", "name": "...", "credits": 3, "semester": "Winter 2024" }
  ],
  "totalCreditsEarned": 21
}
```

---

### `GET /api/mta/schedule/:studentId`
Returns current semester's registered sections.

**Response shape:**
```json
{
  "studentId": "...",
  "semester": "Fall 2025",
  "sections": [
    {
      "courseCode": "COMP 2711",
      "sectionCode": "001",
      "days": ["Tue", "Thu"],
      "startTime": "13:00",
      "endTime": "14:15",
      "room": "Dunn 206"
    }
  ]
}
```

---

### `POST /api/mta/register`
Registers a student for a set of sections. Calls `registerBundle()` from `backend/engine/registration.ts`.

**Request body:**
```json
{
  "studentId": "...",
  "sectionIds": ["section-id-1", "section-id-2"]
}
```

**Response shape:**
```json
{
  "success": true,
  "partialFailure": false,
  "results": [
    { "sectionId": "...", "success": true, "enrollment": { ... } },
    { "sectionId": "...", "success": false, "error": "SECTION_FULL" }
  ],
  "successfulIds": ["..."]
}
```

---

### `GET /api/mta/registration-window/:semester`
Returns whether registration is open for a given semester.

**Response shape:**
```json
{
  "semester": "Fall 2025",
  "status": "open",
  "opensAt": "2025-03-15T09:00:00Z",
  "closesAt": "2025-04-01T23:59:00Z",
  "canRegister": true
}
```

---

## Error codes returned by `/register`

| Code | Meaning |
|------|---------|
| `WINDOW_CLOSED` | Registration window is not open |
| `SECTION_FULL` | No seats remaining |
| `ALREADY_ENROLLED` | Duplicate registration attempt |
| `COURSE_ALREADY_REGISTERED` | Already enrolled in a different section of this course |
| `COURSE_ALREADY_COMPLETED` | Student already passed this course |
| `CREDIT_OVERLOAD` | Would exceed 18 credits for the semester |

---

## Tests

Tests for the mock portal live in `__tests__/api/registration.test.ts`.

The mock endpoints themselves are thin — they delegate to `backend/engine/registration.ts`. Test the engine directly; test the mock endpoints only for correct HTTP response shaping.

### Before generating tests, review:
- [ ] Does `/register` return 200 with `partialFailure: true` (not 400) on partial failure?
- [ ] Does `/register` return 403 (not 200) when window is closed?
- [ ] Does `/transcript` return failed courses separately from completed courses?
- [ ] Does `/registration-window` return `canRegister: false` for "locked" and "completed" status?
