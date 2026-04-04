import { useState } from 'react'
import { useBaby } from '../context/BabyContext'
import { useTimer } from '../hooks/useTimer'
import { Chip } from '../components/Chip'

export function SleepSheet({ onClose }) {
  const { addEvent } = useBaby()
  const [sleepType, setSleepType] = useState('nap')
  const [duration, setDuration] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const timer = useTimer(0, isRunning)
  const [loading, setLoading] = useState(false)

  const handleToggleTimer = () => {
    if (isRunning) {
      timer.pause()
      setIsRunning(false)
    } else {
      timer.start()
      setIsRunning(true)
    }
  }

  const handleSaveWithTimer = async () => {
    if (timer.seconds === 0) {
      alert('Inicie o cronômetro primeiro')
      return
    }

    setLoading(true)
    const event = {
      type: 'sleep',
      category: sleepType,
      duration: Math.floor(timer.seconds / 60), // Convert to minutes
      timestamp: new Date(Date.now() - timer.seconds * 1000),
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

  const handleSaveWithDuration = async () => {
    if (!duration) {
      alert('Por favor, insira a duração')
      return
    }

    setLoading(true)
    const event = {
      type: 'sleep',
      category: sleepType,
      duration: parseInt(duration),
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
        <label className="block text-sm font-semibold text-text-primary mb-2">Tipo de sono</label>
        <div className="flex gap-2">
          <Chip selected={sleepType === 'nap'} onClick={() => setSleepType('nap')}>
            Cochilo
          </Chip>
          <Chip selected={sleepType === 'night'} onClick={() => setSleepType('night')}>
            Noturno
          </Chip>
        </div>
      </div>

      <div className="bg-primary-light rounded-lg p-4">
        <p className="text-center text-sm text-text-secondary mb-2">Usar cronômetro?</p>
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-primary">{timer.formatTime}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggleTimer}
            className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold transition-colors hover:bg-primary/90"
          >
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={() => {
              timer.reset()
              setIsRunning(false)
            }}
            className="flex-1 py-2 bg-border text-text-primary rounded-lg font-semibold transition-colors hover:bg-border/80"
          >
            Resetar
          </button>
        </div>
        {timer.seconds > 0 && (
          <button onClick={handleSaveWithTimer} disabled={loading} className="w-full btn-primary mt-3">
            {loading ? 'Salvando...' : 'Registrar com cronômetro'}
          </button>
        )}
      </div>

      <div className="divider" />

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Ou insira a duração (minutos)
        </label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Ex: 30"
          className="input"
        />
        <div className="flex gap-2 mt-2">
          {[15, 30, 45, 60, 90].map((min) => (
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

      <button
        onClick={handleSaveWithDuration}
        disabled={loading}
        className="w-full btn-primary"
      >
        {loading ? 'Salvando...' : 'Registrar'}
      </button>
    </div>
  )
}
