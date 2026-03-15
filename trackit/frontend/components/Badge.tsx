type BadgeStatus = 'completed' | 'enrolled' | 'planned' | 'failed' | 'delayed' | 'open' | 'locked' | 'preview'

const CONFIG: Record<BadgeStatus, { dot: string; label: string; bg: string; text: string }> = {
  completed: { dot: 'var(--color-done)',      label: 'Done',     bg: '#dcfce7', text: '#15803d' },
  enrolled:  { dot: 'var(--color-active)',    label: 'Enrolled', bg: '#dbeafe', text: '#1d4ed8' },
  planned:   { dot: 'var(--color-planned)',   label: 'Planned',  bg: '#f3f4f6', text: '#374151' },
  failed:    { dot: 'var(--color-failed)',    label: 'Failed',   bg: '#fee2e2', text: '#b91c1c' },
  delayed:   { dot: 'var(--color-delayed)',   label: 'Delayed',  bg: '#fef3c7', text: '#92400e' },
  open:      { dot: 'var(--color-done)',      label: 'OPEN',     bg: '#dcfce7', text: '#15803d' },
  locked:    { dot: 'var(--color-planned)',   label: 'LOCKED',   bg: '#f3f4f6', text: '#374151' },
  preview:   { dot: 'var(--color-delayed)',   label: 'PREVIEW',  bg: '#fef3c7', text: '#92400e' },
}

interface BadgeProps {
  status: BadgeStatus
  label?: string       // override the default label
  className?: string
}

export default function Badge({ status, label, className = '' }: BadgeProps) {
  const cfg = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      {label ?? cfg.label}
    </span>
  )
}
