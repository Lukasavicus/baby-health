import { useState } from 'react'
import { useBaby } from '../context/BabyContext'
import { Chip } from '../components/Chip'

export function FeedingSheet({ onClose }) {
  const { addEvent } = useBaby()
  const [feedingType, setFeedingType] = useState('mamadeira')
  const [amount, setAmount] = useState('')
  const [milkType, setMilkType] = useState('formula')
  const [duration, setDuration] = useState('')
  const [side, setSide] = useState('')
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (feedingType === 'mamadeira' && !amount) {
      alert('Por favor, insira a quantidade')
      return
    }

    setLoading(true)

    const event = {
      type: 'feeding',
      category: feedingType,
      timestamp: new Date(),
      caregiver: 'Eu',
    }

    if (feedingType === 'mamadeira') {
      event.amount = parseInt(amount)
      event.feedingType = milkType
    } else if (feedingType === 'amamentação') {
      if (duration) event.duration = parseInt(duration)
      if (isAdvanced && side) event.side = side
    } else if (feedingType === 'sólidos') {
      event.notes = ''
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
          <Chip selected={feedingType === 'mamadeira'} onClick={() => setFeedingType('mamadeira')}>
            Mamadeira
          </Chip>
          <Chip
            selected={feedingType === 'amamentação'}
            onClick={() => setFeedingType('amamentação')}
          >
            Amamentação
          </Chip>
          <Chip selected={feedingType === 'sólidos'} onClick={() => setFeedingType('sólidos')}>
            Sólidos
          </Chip>
        </div>
      </div>

      {feedingType === 'mamadeira' && (
        <>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Quantidade</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Digite em ml"
              className="input"
            />
            <div className="flex gap-2 mt-2">
              {[30, 60, 90, 120, 150].map((ml) => (
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

          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Tipo de leite</label>
            <div className="flex gap-2">
              <Chip selected={milkType === 'formula'} onClick={() => setMilkType('formula')}>
                Fórmula
              </Chip>
              <Chip selected={milkType === 'breastmilk'} onClick={() => setMilkType('breastmilk')}>
                Leite materno
              </Chip>
            </div>
          </div>
        </>
      )}

      {feedingType === 'amamentação' && (
        <>
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">Duração (min)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Opcional"
              className="input"
            />
          </div>

          <button
            onClick={() => setIsAdvanced(!isAdvanced)}
            className="text-primary text-sm font-semibold hover:text-primary/80"
          >
            {isAdvanced ? '- Modo básico' : '+ Modo avançado'}
          </button>

          {isAdvanced && (
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-2">Lado</label>
              <div className="flex gap-2">
                <Chip selected={side === 'left'} onClick={() => setSide('left')}>
                  Esquerdo
                </Chip>
                <Chip selected={side === 'right'} onClick={() => setSide('right')}>
                  Direito
                </Chip>
                <Chip selected={side === 'both'} onClick={() => setSide('both')}>
                  Ambos
                </Chip>
              </div>
            </div>
          )}
        </>
      )}

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
