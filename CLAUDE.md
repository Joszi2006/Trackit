# Trackit — Design Rules

These rules are enforced by the design-check hook on every Write/Edit.
Violations are blocked. No exceptions.

---

## Layer Boundaries (hard rules)

| Layer | Can import from | Cannot import from |
|-------|----------------|--------------------|
| `frontend/` | `shared/types/` only | `backend/`, `prisma/` |
| `app/(pages)/` | `frontend/components/`, `frontend/hooks/`, `shared/types/` | `backend/`, `prisma/` |
| `app/api/` | `backend/`, `shared/types/` | `frontend/` |
| `backend/engine/` | `shared/types/` | `frontend/`, `app/`, `prisma/` (except registration.ts) |
| `backend/ai/` | `shared/types/` | `frontend/`, `app/` |
| `backend/prisma.ts` | `@prisma/client` only | everything else |
| `backend/registration.ts` | `backend/prisma.ts`, `shared/types/` | `frontend/`, `app/` |
| `mock-self-service/` | `backend/engine/registration.ts`, `backend/prisma.ts` | `frontend/` |
| `shared/types/` | nothing | nothing |

**Rule of thumb:** data flows UP — DB → backend → API route → frontend. Never sideways or down.

---

## File rules
- Max **350 lines** per file — split by responsibility if exceeded
- Max **8 exports** per file — more means the file is doing too many things
- One concept per file — don't bundle unrelated things

## Function rules
- Max **60 lines** per function
- One responsibility per function — if you need "and" to describe it, split it
- Pure functions wherever possible — especially in `backend/engine/`
- Extract named helpers instead of nesting logic

## API route rules
- Routes are **thin** — parse request → call one backend function → return response
- Max **60 lines** per route file
- No business logic inline — it belongs in `backend/`

## Component rules
- Components receive data as **props or from hooks** — no direct fetch() calls inside components
- No algorithmic logic in page files — belongs in hooks or backend
- Hooks (`use*`) are the only place that call API routes from the frontend

## Coupling rules
- `backend/engine/graph.ts`, `distribution.ts`, `scheduler.ts` are **pure functions** — no Prisma, no HTTP
- Only `backend/engine/registration.ts` and `backend/prisma.ts` touch the database
- Zustand store holds UI state only — no derived computation, no API calls

## TypeScript rules
- No `any` — if the shape is unknown, define it in `shared/types/`
- No non-null assertions (`!`) unless the value is provably set (e.g., after `.has()`)
- Always wrap optional chaining + nullish coalescing in parentheses: `(foo?.bar ?? fallback)` — never `foo?.bar ?? fallback` inline in an expression, as `??` has lower precedence than `+`/`-`/etc.
- Prefer `unknown` over `any` for untyped external input

## Immutability
- Never mutate function inputs — return new data, don't modify what was passed in
- Applies everywhere: engine helpers, hooks, API handlers, Zustand actions

## Constants
- No magic strings or numbers inline — extract named constants
- Examples: credit limit (`MAX_CREDITS = 18`), lab seats (`LAB_SEATS = 5`), semester strings

## Error handling
- **Async functions throw — they don't catch.** Let errors bubble to the boundary.
- API routes own the single `try/catch` per handler — map errors to HTTP responses there
- Never swallow errors silently (`catch (e) { return null }` is banned)
- Engine pure functions may throw for truly unrecoverable states (e.g. circular prereqs)
- Expected failure states (no valid schedule, window locked) return a **typed result object** with a `reason` field — not a thrown error

## Graceful degradation (UX)
- The app never shows a blank screen or an unhandled crash to the user
- Every API error response includes a human-readable `message`
- Frontend always renders a fallback state — loading, empty, or error — never nothing

## Naming
- Names say what something **is** or **does**, not how it works
- `eligibleCourses` not `filteredArr` — `isWindowOpen` not `flag`
- Boolean variables and functions start with `is`, `has`, or `can`

## Before writing any function, ask:
1. Does this function do **exactly one thing**?
2. Am I in the **right layer** for this logic?
3. Can this be **tested in isolation**?
4. Am I **importing across a layer boundary**?
5. Will this function still be understandable in 2 weeks?

---

## Testing
- Write tests from the spec, not from the implementation — tests define what SHOULD happen
- If a test fails, fix the implementation. Never adjust tests to make them pass.
- Test edge cases and failure modes, not just the happy path
- Pure functions (engine/) → unit tests with constructed data, no mocks
- DB-touching functions (registration.ts) → integration tests only, skip for now

## Working directory
All code lives in `trackit/`. Run all commands from there:
```bash
cd trackit
npm run dev
npx prisma migrate dev
npx prisma db seed
```

