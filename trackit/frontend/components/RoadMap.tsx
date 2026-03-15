'use client'

import CourseChip from './CourseChip'
import StudentCharacter from './StudentCharacter'
import CareerGoalMarker from './CareerGoalMarker'

// viewBox dimensions
const VW = 880
const VH = 700

// 8 semester stops — snake left→right→left→right (sem 1 at bottom, sem 8 near top)
const STOPS = [
  { x: 140, y: 605, semNum: 1, label: 'Year 1 · Fall',   chipsDir: 'right' },
  { x: 740, y: 585, semNum: 2, label: 'Year 1 · Winter',  chipsDir: 'left'  },
  { x: 175, y: 435, semNum: 3, label: 'Year 2 · Fall',    chipsDir: 'right' },
  { x: 705, y: 415, semNum: 4, label: 'Year 2 · Winter',  chipsDir: 'left'  },
  { x: 140, y: 275, semNum: 5, label: 'Year 3 · Fall',    chipsDir: 'right' },
  { x: 740, y: 255, semNum: 6, label: 'Year 3 · Winter',  chipsDir: 'left'  },
  { x: 175, y: 125, semNum: 7, label: 'Year 4 · Fall',    chipsDir: 'right' },
  { x: 705, y: 110, semNum: 8, label: 'Year 4 · Winter',  chipsDir: 'left'  },
] as const

const GOAL = { x: 440, y: 30 }

// Cubic bezier path connecting all stops + goal (flipped vertically)
const ROAD_PATH = [
  `M ${STOPS[0].x},${STOPS[0].y}`,
  `C 360,628 530,562 ${STOPS[1].x},${STOPS[1].y}`,
  `C 855,598 860,485 ${STOPS[2].x},${STOPS[2].y}`,
  `C 80,418 610,440 ${STOPS[3].x},${STOPS[3].y}`,
  `C 845,402 848,300 ${STOPS[4].x},${STOPS[4].y}`,
  `C 75,258 610,280 ${STOPS[5].x},${STOPS[5].y}`,
  `C 850,242 852,152 ${STOPS[6].x},${STOPS[6].y}`,
  `C 80,110 600,128 ${STOPS[7].x},${STOPS[7].y}`,
  `C 780,100 550,40 ${GOAL.x},${GOAL.y}`,
].join(' ')

type ChipStatus = 'completed' | 'enrolled' | 'planned' | 'failed' | 'delayed'

export interface SemesterStop {
  semNum: number
  chips: Array<{ code: string; status: ChipStatus }>
}

interface RoadMapProps {
  semesters:          SemesterStop[]
  currentSemester:    number
  careerTags:         string[]
  onSemesterClick?:   (semNum: number) => void
  selectedSemNum?:    number
}

const RADIUS_DONE    = 26
const RADIUS_CURRENT = 32
const RADIUS_FUTURE  = 22

export default function RoadMap({ semesters, currentSemester, careerTags, onSemesterClick, selectedSemNum }: RoadMapProps) {
  const semMap = new Map(semesters.map(s => [s.semNum, s]))

  return (
    <div className="relative w-full" style={{ aspectRatio: `${VW}/${VH}` }}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="absolute inset-0 w-full h-full"
        style={{ overflow: 'visible' }}
      >
        {/* Road — thick grey track + thin ink line on top */}
        <path d={ROAD_PATH} fill="none" stroke="#e5e7eb" strokeWidth={22} strokeLinecap="round" />
        <path d={ROAD_PATH} fill="none" stroke="#d1d5db" strokeWidth={6}  strokeLinecap="round" strokeDasharray="8 6" />

        {/* ── Semester stop nodes ── */}
        {STOPS.map(stop => {
          const isPast    = stop.semNum < currentSemester
          const isCurrent = stop.semNum === currentSemester
          const isFuture  = stop.semNum > currentSemester
          const r         = isPast ? RADIUS_DONE : isCurrent ? RADIUS_CURRENT : RADIUS_FUTURE
          const isSelected = stop.semNum === selectedSemNum
          const isRegistered = isCurrent &&
            (semMap.get(stop.semNum)?.chips ?? []).some(c => c.status === 'enrolled')
          const nodeColor = isRegistered ? 'var(--color-done)' : 'var(--color-active)'

          return (
            <g key={stop.semNum}>
              {/* Selected ring — amber, dashed for future */}
              {isSelected && !isCurrent && (
                <circle cx={stop.x} cy={stop.y} r={r + 10}
                  fill="none" stroke="#f59e0b" strokeWidth={2.5}
                  strokeDasharray={isFuture ? '5 3' : 'none'} opacity={0.7} />
              )}
              {isSelected && isCurrent && (
                <circle cx={stop.x} cy={stop.y} r={r + 16}
                  fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.5} />
              )}

              {/* Glow ring on current stop */}
              {isCurrent && (
                <>
                  <circle cx={stop.x} cy={stop.y} r={r + 12} fill="none"
                    stroke={nodeColor} strokeWidth={4} opacity={0.18} />
                  <circle cx={stop.x} cy={stop.y} r={r + 6} fill="none"
                    stroke={nodeColor} strokeWidth={3} opacity={0.35} />
                </>
              )}

              {/* Main node circle */}
              <circle
                cx={stop.x} cy={stop.y} r={r}
                fill={isPast ? '#1a1a1a' : isCurrent ? nodeColor : '#f9fafb'}
                stroke={isPast ? '#1a1a1a' : isCurrent ? nodeColor : '#d1d5db'}
                strokeWidth={isCurrent ? 0 : 2.5}
              />

              {/* Drop shadow for done + current nodes */}
              {(isPast || isCurrent) && (
                <circle cx={stop.x + 3} cy={stop.y + 4} r={r}
                  fill={isPast ? '#1a1a1a' : nodeColor}
                  opacity={0.18}
                  style={{ zIndex: -1 }}
                />
              )}

              {/* Checkmark for completed semesters */}
              {isPast && (
                <text x={stop.x} y={stop.y + 5} textAnchor="middle"
                  fontSize={20} fill="white" fontWeight="900">✓</text>
              )}

              {/* Semester number for future nodes */}
              {!isPast && !isCurrent && (
                <text x={stop.x} y={stop.y + 4} textAnchor="middle"
                  fontSize={11} fill="#9ca3af" fontWeight="600"
                  fontFamily="var(--font-caveat), cursive">
                  S{stop.semNum}
                </text>
              )}

              {/* Transparent hit-target for click */}
              {onSemesterClick && (
                <circle
                  cx={stop.x} cy={stop.y} r={r + 14}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSemesterClick(stop.semNum)}
                />
              )}
            </g>
          )
        })}

        {/* ── Semester labels ── */}
        {STOPS.map(stop => {
          const isPast    = stop.semNum < currentSemester
          const isCurrent = stop.semNum === currentSemester
          const r         = isPast ? RADIUS_DONE : isCurrent ? RADIUS_CURRENT : RADIUS_FUTURE
          const labelX    = stop.chipsDir === 'right' ? stop.x + r + 6 : stop.x - r - 6
          const anchor    = stop.chipsDir === 'right' ? 'start' : 'end'
          const labelRegistered = isCurrent &&
            (semMap.get(stop.semNum)?.chips ?? []).some(c => c.status === 'enrolled')
          const labelColor = labelRegistered ? 'var(--color-done)' : 'var(--color-active)'

          return (
            <text key={stop.semNum} x={labelX} y={stop.y - r - 4}
              textAnchor={anchor} fontSize={11}
              fill={isCurrent ? labelColor : isPast ? '#6b7280' : '#9ca3af'}
              fontFamily="var(--font-caveat), cursive" fontWeight={isCurrent ? '700' : '600'}
            >
              {STOPS[stop.semNum - 1].label}
            </text>
          )
        })}

        {/* Goal marker */}
        <CareerGoalMarker careerTags={careerTags} x={GOAL.x} y={GOAL.y} size={0.85} />

        {/* Student character on current semester stop */}
        {(() => {
          const stop = STOPS.find(s => s.semNum === currentSemester)
          if (!stop) return null
          return <StudentCharacter x={stop.x} y={stop.y - RADIUS_CURRENT - 2} size={0.9} />
        })()}
      </svg>

      {/* HTML course chip overlays */}
      {STOPS.map(stop => {
        const sem = semMap.get(stop.semNum)
        if (!sem || sem.chips.length === 0) return null
        if (selectedSemNum === undefined || stop.semNum !== selectedSemNum) return null

        const leftPct = (stop.x / VW) * 100
        const topPct  = (stop.y / VH) * 100
        const isRight = stop.chipsDir === 'right'

        return (
          <div
            key={stop.semNum}
            className="absolute flex flex-col gap-0.5 pointer-events-none"
            style={{
              left:      isRight ? `${leftPct + 4.5}%` : undefined,
              right:     isRight ? undefined : `${100 - leftPct + 3.5}%`,
              top:       `${topPct}%`,
              transform: 'translateY(-50%)',
              maxWidth:  '26%',
            }}
          >
            {sem.chips.map((chip, i) => (
              <CourseChip key={i} code={chip.code} status={chip.status} small />
            ))}
          </div>
        )
      })}
    </div>
  )
}
