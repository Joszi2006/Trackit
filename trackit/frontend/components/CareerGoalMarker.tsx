// Flat-vector career goal marker — switches illustration based on career tags.
// Renders as an SVG group, positioned at the goal point on the road map.

interface CareerGoalMarkerProps {
  careerTags: string[]
  x?: number
  y?: number   // center of the marker
  size?: number
}

function LaptopMarker({ s }: { s: number }) {
  return (
    <g>
      <rect x={-22 * s} y={-18 * s} width={44 * s} height={28 * s} rx={3 * s}
        fill="#dbeafe" stroke="#1a1a1a" strokeWidth={2 * s} />
      <rect x={-16 * s} y={-12 * s} width={32 * s} height={16 * s}
        fill="#1a1a1a" />
      <text x={0} y={-4 * s} textAnchor="middle" fontSize={8 * s} fill="#8b5cf6"
        fontFamily="monospace" fontWeight="bold">{'{}'}</text>
      <rect x={-26 * s} y={10 * s} width={52 * s} height={5 * s} rx={2 * s}
        fill="#1a1a1a" stroke="#1a1a1a" strokeWidth={1.5 * s} />
    </g>
  )
}

function MicroscopeMarker({ s }: { s: number }) {
  return (
    <g>
      <rect x={-4 * s} y={-20 * s} width={8 * s} height={24 * s}
        fill="#bbf7d0" stroke="#1a1a1a" strokeWidth={2 * s} />
      <rect x={-8 * s} y={-22 * s} width={16 * s} height={6 * s} rx={2 * s}
        fill="#4ade80" stroke="#1a1a1a" strokeWidth={2 * s} />
      <path d={`M ${-4 * s},${4 * s} L ${-16 * s},${14 * s} L ${16 * s},${14 * s} L ${4 * s},${4 * s} Z`}
        fill="#4ade80" stroke="#1a1a1a" strokeWidth={2 * s} />
      <rect x={-18 * s} y={12 * s} width={36 * s} height={4 * s}
        fill="#1a1a1a" />
    </g>
  )
}

function BriefcaseMarker({ s }: { s: number }) {
  return (
    <g>
      <rect x={-22 * s} y={-10 * s} width={44 * s} height={28 * s} rx={3 * s}
        fill="#fef3c7" stroke="#1a1a1a" strokeWidth={2 * s} />
      <path d={`M ${-10 * s},${-10 * s} L ${-10 * s},${-18 * s} L ${10 * s},${-18 * s} L ${10 * s},${-10 * s}`}
        fill="none" stroke="#1a1a1a" strokeWidth={2 * s} />
      <rect x={-3 * s} y={2 * s} width={6 * s} height={6 * s} rx={1 * s}
        fill="#d97706" stroke="#1a1a1a" strokeWidth={1.5 * s} />
      <line x1={-22 * s} y1={4 * s} x2={22 * s} y2={4 * s}
        stroke="#1a1a1a" strokeWidth={1.5 * s} />
    </g>
  )
}

function GradCapMarker({ s }: { s: number }) {
  return (
    <g>
      <polygon points={`0,${-20 * s} ${-24 * s},${-6 * s} 0,${8 * s} ${24 * s},${-6 * s}`}
        fill="#8b5cf6" stroke="#1a1a1a" strokeWidth={2 * s} />
      <rect x={-12 * s} y={-6 * s} width={24 * s} height={14 * s}
        fill="#7c3aed" stroke="#1a1a1a" strokeWidth={2 * s} />
      <line x1={24 * s} y1={-6 * s} x2={24 * s} y2={8 * s}
        stroke="#1a1a1a" strokeWidth={2 * s} />
      <circle cx={24 * s} cy={10 * s} r={3 * s}
        fill="#f59e0b" stroke="#1a1a1a" strokeWidth={1.5 * s} />
    </g>
  )
}

export default function CareerGoalMarker({ careerTags, x = 0, y = 0, size = 1 }: CareerGoalMarkerProps) {
  const s = size
  const isTech     = careerTags.some(t => ['machine-learning', 'data-science', 'fullstack', 'backend', 'algorithms'].includes(t))
  const isBio      = careerTags.some(t => ['biology', 'chemistry', 'health-sciences'].includes(t))
  const isBusiness = careerTags.some(t => ['accounting', 'finance', 'economics', 'business'].includes(t))

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Glow circle behind marker */}
      <circle cx={0} cy={0} r={32 * s} fill="#f3e8ff" stroke="#8b5cf6" strokeWidth={2 * s} strokeDasharray={`${4 * s} ${3 * s}`} />

      {isTech     && <LaptopMarker s={s} />}
      {!isTech && isBio      && <MicroscopeMarker s={s} />}
      {!isTech && !isBio && isBusiness && <BriefcaseMarker s={s} />}
      {!isTech && !isBio && !isBusiness && <GradCapMarker s={s} />}

      {/* "GOAL" label */}
      <text x={0} y={44 * s} textAnchor="middle"
        fontSize={10 * s} fill="#8b5cf6" fontWeight="bold"
        fontFamily="var(--font-caveat), cursive"
      >
        Your Goal
      </text>
    </g>
  )
}
