interface SketchCardProps {
  children: React.ReactNode
  className?: string
  accent?: boolean   // thicker offset border for selected/highlighted state
}

export default function SketchCard({ children, className = '', accent = false }: SketchCardProps) {
  const shadow = accent
    ? '6px 6px 0px var(--color-ink)'
    : '4px 4px 0px var(--color-ink)'

  return (
    <div
      className={`bg-[var(--color-card)] border-2 border-[var(--color-ink)] rounded-lg p-5 ${className}`}
      style={{ boxShadow: shadow }}
    >
      {children}
    </div>
  )
}
