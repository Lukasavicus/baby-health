import { useState } from 'react'
import { useBaby } from '../context/BabyContext'
import { Chip } from '../components/Chip'

export function DiaperSheet({ onClose }) {
  const { addEvent } = useBaby()
  const [diaperType, setDiaperType] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const types = [
    { id: 'wet', label: 'Molhada', emoji: '💧' },
    { id: 'dirty', label: 'Suja', emoji: '💩' },
    { id: 'mixed', label: 'Molhada e suja', emoji: '🤢' },
  ]

  const handleSave = async () => {
    if (!diaperType) {
      alert('Por favor, selecione um tipo')
      return
    }

    setLoading(true)

    const event = {
      type: 'diaper',
      category: diaperType,
      timestamp: new Date(),
      caregiver: 'Eu',
    }

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
        <label className="block text-sm font-semibold text-text-primary mb-2">Tipo de fralda</label>
        <div className="grid grid-cols-3 gap-2">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setDiaperType(type.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                diaperType === type.id
                  ? 'border-primary bg-primary-light'
                  : 'border-border bg-surface hover:bg-primary-light/50'
              }`}
            >
              <div className="text-2xl mb-1">{type.emoji}</div>
              <p className="text-xs font-semibold text-text-primary">{type.label}</p>
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
          placeholder="Ex: aspecto da cor, consistência..."
          className="input resize-none h-20"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !diaperType}
        className="w-full btn-primary"
      >
        {loading ? 'Salvando...' : 'Registrar'}
      </button>
    </div>
  )
}
