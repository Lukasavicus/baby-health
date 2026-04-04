export function TrackerCard({
  icon: Icon,
  title,
  value,
  unit = '',
  description = '',
  progress = null,
  onClick,
  secondaryValue = null,
  color = 'primary',
}) {
  const colorClasses = {
    primary: 'text-primary bg-primary-light',
    secondary: 'text-secondary bg-orange-100',
    accent: 'text-accent bg-teal-100',
    warning: 'text-warning bg-orange-100',
    success: 'text-success bg-green-100',
  }

  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-lg shadow-soft p-4 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-soft-lg active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <h3 className="text-sm text-text-secondary font-medium mb-1">{title}</h3>

      <div className="mb-2">
        <div className="text-2xl font-bold text-text-primary">
          {value}
          <span className="text-sm text-text-secondary font-normal ml-1">{unit}</span>
        </div>
        {secondaryValue && <p className="text-xs text-text-secondary mt-0.5">{secondaryValue}</p>}
      </div>

      {description && <p className="text-xs text-text-secondary">{description}</p>}

      {progress && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-text-primary">{progress.label}</span>
            <span className="text-text-secondary">
              {progress.current}/{progress.goal}
            </span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${Math.min((progress.current / progress.goal) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
