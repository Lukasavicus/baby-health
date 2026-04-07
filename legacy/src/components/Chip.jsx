export function Chip({ children, selected = false, onClick, disabled = false, className = '' }) {
  const baseClasses =
    'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer'
  const selectedClass = selected
    ? 'bg-primary text-white shadow-soft'
    : 'bg-surface border border-border text-text-primary hover:bg-primary-light'
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${selectedClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  )
}
