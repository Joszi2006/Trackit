type ChipStatus = 'completed' | 'enrolled' | 'planned' | 'failed' | 'delayed'

const STATUS_COLORS: Record<ChipStatus, string> = {
  completed: 'var(--color-done)',
  enrolled:  'var(--color-active)',
  planned:   'var(--color-planned)',
  failed:    'var(--color-failed)',
  delayed:   'var(--color-delayed)',
}

interface CourseChipProps {
  code: string
  status: ChipStatus
  small?: boolean
}

export default function CourseChip({ code, status, small = false }: CourseChipProps) {
  const color = STATUS_COLORS[status]

  return (
    <span
      className={`
        inline-flex items-center bg-white border border-[var(--color-rule)]
        rounded font-mono whitespace-nowrap
        ${small ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'}
      `}
      style={{ borderLeftWidth: 3, borderLeftColor: color }}
    >
      {code}
    </span>
  )
}
