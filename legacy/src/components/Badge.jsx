export function Badge({ children, variant = 'primary', className = '' }) {
  const baseClasses = 'inline-block px-2 py-1 rounded-full text-xs font-semibold'
  const variants = {
    primary: 'bg-primary-light text-primary',
    secondary: 'bg-orange-100 text-orange-700',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  }

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
