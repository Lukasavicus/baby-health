import { useState } from 'react'
import { useBaby } from '../context/BabyContext'
import { Chip } from '../components/Chip'

export function HydrationSheet({ onClose }) {
  const { addEvent } = useBaby()
  const [amount, setAmount] = useState('')
  const [hydrationType, setHydrationType] = useState('water')
  const [loading, setLoading] = useState(false)

  const types = [
    { id: 'water', label: 'Água' },
    { id: 'juice', label: 'Suco' },
    { id: 'other', label: 'Outro' },
  ]

  const handleSave = async () => {
    if (!amount) {
      alert('Por favor, insira a quantidade')
      return
    }

    setLoading(true)

    const event = {
      type: 'hydration',
      amount: parseInt(amount),
      hydrationType: hydrationType,
      timestamp: new Date(),
      caregiver: 'Eu',
    }

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
        <label className="block text-sm font-semibold text-text-primary mb-2">Tipo</label>
        <div className="flex gap-2">
          {types.map((type) => (
            <Chip
              key={type.id}
              selected={hydrationType === type.id}
              onClick={() => setHydrationType(type.id)}
            >
              {type.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">Quantidade (ml)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Digite em ml"
          className="input"
        />
        <div className="flex gap-2 mt-2">
          {[30, 60, 90, 120, 150, 200].map((ml) => (
            <button
              key={ml}
              onClick={() => setAmount(ml.toString())}
              className="flex-1 py-2 bg-primary-light text-primary rounded-lg text-sm font-semibold transition-colors hover:bg-primary hover:text-white"
            >
              {ml}ml
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Salvando...' : 'Registrar'}
      </button>
    </div>
  )
}
