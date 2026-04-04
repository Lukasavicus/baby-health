import { useState } from 'react'
import { useBaby } from '../context/BabyContext'
import { Chip } from '../components/Chip'

export function ActivitySheet({ onClose }) {
  const { addEvent } = useBaby()
  const [activityType, setActivityType] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const activities = [
    { id: 'tummy_time', label: 'Barriga', emoji: '🦦' },
    { id: 'leitura', label: 'Leitura', emoji: '📚' },
    { id: 'brincadeira', label: 'Brincadeira', emoji: '🎮' },
    { id: 'passeio', label: 'Passeio', emoji: '🚶' },
    { id: 'banho', label: 'Banho', emoji: '🛁' },
  ]

  const handleSave = async () => {
    if (!activityType) {
      alert('Por favor, selecione uma atividade')
      return
    }

    setLoading(true)

    const event = {
      type: 'activity',
      category: activityType,
      timestamp: new Date(),
      caregiver: 'Eu',
    }

    if (duration) event.duration = parseInt(duration)
    if (notes) event.notes = notes

    try {
      await addEvent(event)
      onClose()
    } catch (error) {
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">Atividade</label>
        <div className="grid grid-cols-2 gap-2">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => setActivityType(activity.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                activityType === activity.id
                  ? 'border-primary bg-primary-light'
                  : 'border-border bg-surface hover:bg-primary-light/50'
              }`}
            >
              <div className="text-2xl mb-1">{activity.emoji}</div>
              <p className="text-xs font-semibold text-text-primary">{activity.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Duração (minutos - opcional)
        </label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Ex: 15"
          className="input"
        />
        <div className="flex gap-2 mt-2">
          {[5, 10, 15, 20, 30].map((min) => (
            <button
              key={min}
              onClick={() => setDuration(min.toString())}
              className="flex-1 py-2 bg-primary-light text-primary rounded-lg text-sm font-semibold transition-colors hover:bg-primary hover:text-white"
            >
              {min}m
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Observações (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Digite aqui..."
          className="input resize-none h-20"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !activityType}
        className="w-full btn-primary"
      >
        {loading ? 'Salvando...' : 'Registrar'}
      </button>
    </div>
  )
}
