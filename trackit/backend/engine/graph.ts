// Stage 1 — DAG + Topological Sort (Kahn's algorithm)
// Pure functions: no Prisma, no HTTP. Receives Course[] from the API layer.
import type { Course, CourseNode, FailedCourseStatus } from '@/shared/types'

// ─────────────────────────────────────────────
// Exported — Stage 1 entry point
// ─────────────────────────────────────────────

/**
 * Builds a prerequisite graph from all courses, filters out completed ones,
 * runs Kahn's topological sort, and returns courses ordered by depth ASC,
 * careerScore DESC. Depth 0 = all prerequisites already met.
 */
export function buildPrerequisiteGraph(
  courses: Course[],
  completedIds: string[],
  failedIds: string[],
  careerTags: string[],
): CourseNode[] {
  const completedSet = new Set(completedIds)

  // Working set: exclude courses the student has already passed
  const workingSet = courses.filter(c => !completedSet.has(c.id))

  const { adj, inDegree } = buildAdjacency(workingSet, completedSet)
  const depthMap = computeDepths(workingSet, adj, inDegree)

  return workingSet
    .map(course => ({
      course,
      depth: depthMap.get(course.id) ?? 0,
      careerScore: computeCareerScore(course, careerTags, adj),
    }))
    .sort((a, b) => a.depth - b.depth || b.careerScore - a.careerScore)
}

/**
 * Classifies each failed course as retakable (offered this semester) or delayed.
 */
export function handleFailedCourses(
  courses: Course[],
  failedIds: string[],
  currentSemester: number,
): FailedCourseStatus {
  const semesterType = currentSemester % 2 === 1 ? 'Fall' : 'Winter'
  const courseMap = new Map(courses.map(c => [c.id, c]))

  const retakable: string[] = []
  const delayed: Array<{ courseId: string; reason: string }> = []

  for (const id of failedIds) {
    const course = courseMap.get(id)
    if (!course) continue

    if (course.offeringFrequency === 'every_two_years') {
      delayed.push({ courseId: id, reason: 'only offered every two years' })
    } else if (course.semestersOffered.includes(semesterType)) {
      retakable.push(id)
    } else {
      delayed.push({ courseId: id, reason: 'not offered this semester' })
    }
  }

  return { retakable, delayed, unreachable: [] }
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Builds adjacency list and in-degree map for Kahn's BFS.
 * adj[prereqId] = list of course IDs that are unlocked when prereqId is completed.
 * inDegree[courseId] = count of prerequisites NOT yet in completedSet.
 */
function buildAdjacency(
  workingSet: Course[],
  completedSet: Set<string>,
): { adj: Map<string, string[]>; inDegree: Map<string, number> } {
  const adj = new Map<string, string[]>()
  const inDegree = new Map<string, number>()
  const workingIds = new Set(workingSet.map(c => c.id))

  for (const course of workingSet) {
    inDegree.set(course.id, 0)
    if (!adj.has(course.id)) adj.set(course.id, [])
  }

  for (const course of workingSet) {
    for (const prereqId of course.prerequisites) {
      if (completedSet.has(prereqId)) continue  // already done — doesn't block
      if (!workingIds.has(prereqId)) continue   // unknown course — skip safely

      inDegree.set(course.id, (inDegree.get(course.id) ?? 0) + 1)

      const dependents = adj.get(prereqId) ?? []
      dependents.push(course.id)
      adj.set(prereqId, dependents)
    }
  }

  return { adj, inDegree }
}

/**
 * Kahn's BFS — processes courses level by level, assigning depth per level.
 * Throws if a cycle is detected (should never happen in real curriculum data).
 */
function computeDepths(
  workingSet: Course[],
  adj: Map<string, string[]>,
  inDegree: Map<string, number>,
): Map<string, number> {
  const depthMap = new Map<string, number>()
  const queue: string[] = []

  for (const course of workingSet) {
    if ((inDegree.get(course.id) ?? 0) === 0) {
      queue.push(course.id)
      depthMap.set(course.id, 0)
    }
  }

  let processed = 0

  while (queue.length > 0) {
    const courseId = queue.shift()!
    processed++

    const currentDepth = depthMap.get(courseId) ?? 0

    for (const dependentId of (adj.get(courseId) ?? [])) {
      const remaining = (inDegree.get(dependentId) ?? 1) - 1
      inDegree.set(dependentId, remaining)

      if (remaining === 0) {
        depthMap.set(dependentId, currentDepth + 1)
        queue.push(dependentId)
      }
    }
  }

  if (processed < workingSet.length) {
    throw new Error('Circular prerequisite detected')
  }

  return depthMap
}

/**
 * Career relevance score for a course.
 * tagOverlap: how many of the course's tags match the student's career tags.
 * outDegreeBonus: courses that list this as a prerequisite (gateway value).
 */
function computeCareerScore(
  course: Course,
  careerTags: string[],
  adj: Map<string, string[]>,
): number {
  const tagSet       = new Set(careerTags)
  const tagOverlap   = course.careerTags.filter(t => tagSet.has(t)).length
  const gatewayBonus = Math.min((adj.get(course.id) ?? []).length, 2)
  return tagOverlap * 4 + gatewayBonus
}
