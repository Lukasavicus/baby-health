import { useRelativeTime } from '../hooks/useEvents'
import { Trash2 } from 'lucide-react'

const eventIcons = {
  feeding: '🍼',
  sleep: '😴',
  diaper: '👶',
  hydration: '💧',
  activity: '⭐',
}

const categoryNames = {
  mamadeira: 'Mamadeira',
  amamentação: 'Amamentação',
  sólidos: 'Sólidos',
  wet: 'Fralda molhada',
  dirty: 'Fralda suja',
  mixed: 'Fralda molhada e suja',
  nap: 'Cochilo',
  night: 'Sono noturno',
  tummy_time: 'Barriga',
  leitura: 'Leitura',
  brincadeira: 'Brincadeira',
  passeio: 'Passeio',
  banho: 'Banho',
}

export function EventItem({ event, onDelete }) {
  const relativeTime = useRelativeTime(event.timestamp)

  const getEventDetails = () => {
    switch (event.type) {
      case 'feeding':
        let feedingText = categoryNames[event.category] || 'Alimentação'
        if (event.amount) feedingText += ` • ${event.amount}ml`
        if (event.duration) feedingText += ` • ${event.duration}min`
        return feedingText
      case 'sleep':
        return `${categoryNames[event.category] || 'Sono'} • ${event.duration || 0}min`
      case 'diaper':
        return categoryNames[event.category] || 'Fralda'
      case 'hydration':
        return `Hidratação • ${event.amount || 0}ml`
      case 'activity':
        return categoryNames[event.category] || 'Atividade'
      default:
        return event.type
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-surface rounded-lg hover:bg-primary-light/20 transition-colors">
      <div className="text-2xl">{eventIcons[event.type] || '📝'}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{getEventDetails()}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-text-secondary">{relativeTime}</p>
          {event.caregiver && <span className="text-xs text-text-secondary">• {event.caregiver}</span>}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(event.id)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-text-secondary hover:text-red-500" />
        </button>
      )}
    </div>
  )
}
