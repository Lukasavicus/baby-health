import { HelpCircle } from 'lucide-react'

export function EmptyState({
  icon: Icon = HelpCircle,
  title = 'Nenhum dado',
  description = 'Não há informações para exibir no momento',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 bg-primary-light rounded-full">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-6 max-w-xs">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
