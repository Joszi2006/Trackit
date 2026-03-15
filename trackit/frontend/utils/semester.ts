// "Year 2 · Fall" display label from semester number (1–8)
export function semesterLabel(semNum: number): string {
  const year = Math.ceil(semNum / 2)
  const term = semNum % 2 === 1 ? 'Fall' : 'Winter'
  return `Year ${year} · ${term}`
}

// "fall-2025" URL slug for the /plan/[semester] route
export function semNumToSlug(semNum: number, startYear: number): string {
  const isFall = semNum % 2 === 1
  const year   = isFall
    ? startYear + Math.floor((semNum - 1) / 2)
    : startYear + Math.floor(semNum / 2)
  return `${isFall ? 'fall' : 'winter'}-${year}`
}
