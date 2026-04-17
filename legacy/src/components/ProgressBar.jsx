export function ProgressBar({ value = 0, max = 100, color = 'primary', label = '', showLabel = true }) {
  const percentage = (value / max) * 100
  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    secondary: 'bg-secondary',
  }

  return (
    <div className="w-full">
      {showLabel && label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-text-primary">{label}</span>
          <span className="text-xs text-text-secondary">
            {value} / {max}
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
