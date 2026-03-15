type ButtonVariant = 'primary' | 'outline' | 'danger'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  loading?: boolean
  children: React.ReactNode
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-ink)] text-white border-2 border-[var(--color-ink)] hover:bg-[#333]',
  outline: 'bg-white text-[var(--color-ink)] border-2 border-[var(--color-ink)] hover:bg-gray-50',
  danger:  'bg-[var(--color-failed)] text-white border-2 border-[var(--color-failed)] hover:opacity-90',
}

export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled ?? loading

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-md text-sm font-medium
        transition-all duration-100
        ${VARIANTS[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        active:translate-y-px
        ${className}
      `}
      style={{ boxShadow: isDisabled ? 'none' : '2px 2px 0px rgba(0,0,0,0.35)' }}
      {...rest}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
