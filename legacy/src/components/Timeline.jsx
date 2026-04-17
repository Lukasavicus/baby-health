import { EventItem } from './EventItem'
import { EmptyState } from './EmptyState'
import { Activity } from 'lucide-react'

export function Timeline({ events, onDelete }) {
  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sem eventos"
        description="Nenhum registro para exibir. Comece a registrar atividades!"
      />
    )
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventItem key={event.id} event={event} onDelete={onDelete} />
      ))}
    </div>
  )
}
