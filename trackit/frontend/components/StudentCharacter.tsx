// Redesigned student character — large expressive head, clean flat-art style.
// Sits above the current semester node on the roadmap.

interface StudentCharacterProps {
  x?: number
  y?: number     // bottom-center of character
  size?: number  // scale factor (1 = ~44×80px)
}

export default function StudentCharacter({ x = 0, y = 0, size = 1 }: StudentCharacterProps) {
  const s  = size
  const cx = x
  const by = y   // bottom y — character is drawn upward from here

  // Key measurements
  const headR     = 16 * s
  const headCY    = by - 64 * s
  const headCX    = cx

  const bodyTop   = headCY + headR - 2 * s
  const bodyBot   = by - 10 * s
  const bodyL     = cx - 13 * s
  const bodyR     = cx + 13 * s

  const legH      = 10 * s

  return (
    <g>
      {/* ── Shadow ── */}
      <ellipse cx={cx} cy={by} rx={16 * s} ry={4 * s} fill="#1a1a1a" opacity={0.12} />

      {/* ── Legs ── */}
      <rect x={cx - 10 * s} y={bodyBot} width={8 * s}  height={legH} rx={3 * s}
        fill="#374151" stroke="#1a1a1a" strokeWidth={1.5 * s} />
      <rect x={cx + 2 * s}  y={bodyBot} width={8 * s}  height={legH} rx={3 * s}
        fill="#374151" stroke="#1a1a1a" strokeWidth={1.5 * s} />

      {/* ── Shoes ── */}
      <ellipse cx={cx - 6 * s}  cy={by - 1 * s} rx={6 * s} ry={3.5 * s} fill="#1a1a1a" />
      <ellipse cx={cx + 6 * s}  cy={by - 1 * s} rx={6 * s} ry={3.5 * s} fill="#1a1a1a" />

      {/* ── Backpack (behind body) ── */}
      <rect x={cx + 11 * s} y={bodyTop + 4 * s} width={9 * s} height={16 * s} rx={3 * s}
        fill="#ef4444" stroke="#1a1a1a" strokeWidth={1.5 * s} />
      <rect x={cx + 12 * s} y={bodyTop + 7 * s} width={7 * s} height={5 * s} rx={1.5 * s}
        fill="#fca5a5" stroke="#1a1a1a" strokeWidth={1 * s} />
      {/* strap */}
      <line x1={cx + 11 * s} y1={bodyTop + 8 * s} x2={cx + 9 * s} y2={bodyTop + 18 * s}
        stroke="#1a1a1a" strokeWidth={2 * s} strokeLinecap="round" />

      {/* ── Body (hoodie) ── */}
      <path d={`
        M ${bodyL},${bodyBot}
        L ${bodyL - 2 * s},${bodyTop + 8 * s}
        Q ${bodyL},${bodyTop} ${cx},${bodyTop}
        Q ${bodyR},${bodyTop} ${bodyR + 2 * s},${bodyTop + 8 * s}
        L ${bodyR},${bodyBot}
        Z
      `} fill="var(--color-character)" stroke="#1a1a1a" strokeWidth={2 * s} strokeLinejoin="round" />

      {/* Hoodie center seam */}
      <line x1={cx} y1={bodyTop + 2 * s} x2={cx} y2={bodyBot}
        stroke="#1a1a1a" strokeWidth={1 * s} opacity={0.2} />

      {/* Hoodie pocket */}
      <rect x={cx - 8 * s} y={bodyBot - 12 * s} width={16 * s} height={9 * s} rx={2 * s}
        fill="#f59e0b" stroke="#1a1a1a" strokeWidth={1.5 * s} />

      {/* ── Left arm ── */}
      <path d={`M ${bodyL},${bodyTop + 8 * s} L ${bodyL - 10 * s},${bodyTop + 24 * s} L ${bodyL - 6 * s},${bodyTop + 26 * s} L ${bodyL + 2 * s},${bodyTop + 14 * s}`}
        fill="var(--color-character)" stroke="#1a1a1a" strokeWidth={2 * s} strokeLinejoin="round" />
      {/* left hand */}
      <circle cx={bodyL - 8 * s} cy={bodyTop + 27 * s} r={3.5 * s} fill="#c8a882" stroke="#1a1a1a" strokeWidth={1.5 * s} />

      {/* ── Right arm (holding book) ── */}
      <path d={`M ${bodyR},${bodyTop + 8 * s} L ${bodyR + 9 * s},${bodyTop + 22 * s} L ${bodyR + 5 * s},${bodyTop + 24 * s} L ${bodyR - 2 * s},${bodyTop + 13 * s}`}
        fill="var(--color-character)" stroke="#1a1a1a" strokeWidth={2 * s} strokeLinejoin="round" />
      {/* book */}
      <rect x={bodyR + 4 * s} y={bodyTop + 20 * s} width={11 * s} height={9 * s} rx={1.5 * s}
        fill="#3b82f6" stroke="#1a1a1a" strokeWidth={1.5 * s} />
      <line x1={bodyR + 9 * s} y1={bodyTop + 20 * s} x2={bodyR + 9 * s} y2={bodyTop + 29 * s}
        stroke="#1a1a1a" strokeWidth={1 * s} />

      {/* ── Neck ── */}
      <rect x={cx - 4 * s} y={headCY + headR - 2 * s} width={8 * s} height={6 * s}
        fill="#c8a882" stroke="#1a1a1a" strokeWidth={1.5 * s} />

      {/* ── Head ── */}
      <circle cx={headCX} cy={headCY} r={headR}
        fill="#c8a882" stroke="#1a1a1a" strokeWidth={2 * s} />

      {/* ── Hair ── */}
      <path d={`
        M ${headCX - headR + 2 * s},${headCY - 4 * s}
        Q ${headCX - headR + 1 * s},${headCY - headR - 4 * s}
          ${headCX},${headCY - headR - 2 * s}
        Q ${headCX + headR - 1 * s},${headCY - headR - 4 * s}
          ${headCX + headR - 2 * s},${headCY - 4 * s}
        Q ${headCX + headR - 5 * s},${headCY - headR + 2 * s}
          ${headCX},${headCY - headR + 1 * s}
        Q ${headCX - headR + 5 * s},${headCY - headR + 2 * s}
          ${headCX - headR + 2 * s},${headCY - 4 * s}
        Z
      `} fill="#1a1a1a" />

      {/* ── Eyes ── */}
      {/* whites */}
      <ellipse cx={headCX - 5.5 * s} cy={headCY + 1 * s} rx={4 * s} ry={4.5 * s} fill="white" stroke="#1a1a1a" strokeWidth={1 * s} />
      <ellipse cx={headCX + 5.5 * s} cy={headCY + 1 * s} rx={4 * s} ry={4.5 * s} fill="white" stroke="#1a1a1a" strokeWidth={1 * s} />
      {/* pupils */}
      <circle cx={headCX - 5 * s} cy={headCY + 1.5 * s} r={2 * s} fill="#1a1a1a" />
      <circle cx={headCX + 5 * s} cy={headCY + 1.5 * s} r={2 * s} fill="#1a1a1a" />
      {/* eye shine */}
      <circle cx={headCX - 4 * s}  cy={headCY + 0.5 * s} r={0.8 * s} fill="white" />
      <circle cx={headCX + 6 * s}  cy={headCY + 0.5 * s} r={0.8 * s} fill="white" />

      {/* ── Smile ── */}
      <path d={`M ${headCX - 5 * s},${headCY + 7 * s} Q ${headCX},${headCY + 12 * s} ${headCX + 5 * s},${headCY + 7 * s}`}
        fill="none" stroke="#1a1a1a" strokeWidth={1.8 * s} strokeLinecap="round" />

      {/* ── Headphones ── */}
      <path d={`M ${headCX - headR + 2 * s},${headCY} Q ${headCX},${headCY - headR - 6 * s} ${headCX + headR - 2 * s},${headCY}`}
        fill="none" stroke="#1a1a1a" strokeWidth={2.5 * s} strokeLinecap="round" />
      <rect x={headCX - headR - 1 * s} y={headCY - 4 * s} width={6 * s} height={9 * s} rx={2.5 * s}
        fill="white" stroke="#1a1a1a" strokeWidth={1.5 * s} />
      <rect x={headCX + headR - 5 * s} y={headCY - 4 * s} width={6 * s} height={9 * s} rx={2.5 * s}
        fill="white" stroke="#1a1a1a" strokeWidth={1.5 * s} />
      {/* headphone color accent */}
      <rect x={headCX - headR} y={headCY - 2 * s} width={4 * s} height={5 * s} rx={1.5 * s} fill="#3b82f6" />
      <rect x={headCX + headR - 4 * s} y={headCY - 2 * s} width={4 * s} height={5 * s} rx={1.5 * s} fill="#3b82f6" />
    </g>
  )
}
