interface ProgressBarProps {
  label: string
  current: number
  total: number
  color?: string    // CSS color string
  className?: string
}

export default function ProgressBar({
  label,
  current,
  total,
  color = 'var(--color-ink)',
  className = '',
}: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100))
  const isDone = current >= total

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex justify-between items-baseline">
        <span className="text-sm text-[var(--color-ink)]">{label}</span>
        <span
          className="text-xs font-medium"
          style={{ color: isDone ? 'var(--color-done)' : 'var(--color-ink-light)' }}
        >
          {current}/{total} {isDone ? '✓' : ''}
        </span>
      </div>

      {/* Sketch-style bar: outer border box, inner fill */}
      <div
        className="w-full h-3 rounded border-2 border-[var(--color-ink)] overflow-hidden bg-white"
        style={{ boxShadow: '2px 2px 0px var(--color-ink)' }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: isDone ? 'var(--color-done)' : color }}
        />
      </div>
    </div>
  )
}
