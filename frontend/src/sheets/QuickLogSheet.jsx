import { useState } from 'react'
import { BottomSheet } from '../components/BottomSheet'
import { Bottle, Moon, Droplet, Baby, Activity } from 'lucide-react'
import { FeedingSheet } from './FeedingSheet'
import { SleepSheet } from './SleepSheet'
import { DiaperSheet } from './DiaperSheet'
import { HydrationSheet } from './HydrationSheet'
import { ActivitySheet } from './ActivitySheet'

export function QuickLogSheet({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState(null)

  const categories = [
    { id: 'feeding', label: 'Alimentação', icon: Bottle, color: 'secondary' },
    { id: 'sleep', label: 'Sono', icon: Moon, color: 'warning' },
    { id: 'diaper', label: 'Fraldas', icon: Baby, color: 'accent' },
    { id: 'hydration', label: 'Hidratação', icon: Droplet, color: 'primary' },
    { id: 'activity', label: 'Atividade', icon: Activity, color: 'success' },
  ]

  const renderSheet = () => {
    switch (activeCategory) {
      case 'feeding':
        return <FeedingSheet onClose={onClose} />
      case 'sleep':
        return <SleepSheet onClose={onClose} />
      case 'diaper':
        return <DiaperSheet onClose={onClose} />
      case 'hydration':
        return <HydrationSheet onClose={onClose} />
      case 'activity':
        return <ActivitySheet onClose={onClose} />
      default:
        return (
          <div className="space-y-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full flex items-center gap-3 p-4 bg-surface rounded-lg border border-border hover:bg-primary-light transition-colors"
                >
                  <div className={`p-3 rounded-lg text-white bg-${cat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">{cat.label}</p>
                    <p className="text-xs text-text-secondary">Registrar agora</p>
                  </div>
                </button>
              )
            })}
          </div>
        )
    }
  }

  const handleClose = () => {
    setActiveCategory(null)
    onClose()
  }

  const title = activeCategory
    ? categories.find((c) => c.id === activeCategory)?.label || 'Novo Registro'
    : 'O que deseja registrar?'

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={title}>
      {activeCategory && (
        <button
          onClick={() => setActiveCategory(null)}
          className="text-primary text-sm font-semibold mb-4 hover:text-primary/80"
        >
          ← Voltar
        </button>
      )}
      {renderSheet()}
    </BottomSheet>
  )
}
