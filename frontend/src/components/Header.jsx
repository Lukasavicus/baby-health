export function Header({ title, subtitle, action }) {
  return (
    <div className="bg-surface border-b border-border sticky top-0 z-40 px-4 py-4">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="ml-4">{action}</div>}
      </div>
    </div>
  )
}
