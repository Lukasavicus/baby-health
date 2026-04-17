import { Header } from '../components/Header'
import { ChevronRight } from 'lucide-react'

export default function RoutinesPage() {
  const routines = [
    {
      id: 1,
      category: 'Sono',
      icon: '😴',
      color: 'warning',
      items: [
        { title: 'Preparando para dormir', description: 'Rotina noturna de 15 min' },
        { title: 'Cochilo vespertino', description: 'Ideal entre 2-3h da tarde' },
      ],
    },
    {
      id: 2,
      category: 'Alimentação',
      icon: '🍼',
      color: 'secondary',
      items: [
        { title: 'Alimentação a cada 3h', description: 'Seguir sinais de fome' },
        { title: 'Introdução de sólidos', description: 'A partir de 6 meses' },
      ],
    },
    {
      id: 3,
      category: 'Desenvolvimento',
      icon: '🎯',
      color: 'success',
      items: [
        { title: 'Tempo de barriga', description: '15-20 min, 3x ao dia' },
        { title: 'Estimulação sensorial', description: 'Sons, cores e texturas' },
      ],
    },
    {
      id: 4,
      category: 'Higiene',
      icon: '🛁',
      color: 'accent',
      items: [
        { title: 'Banho diário', description: 'Ideal no final da tarde' },
        { title: 'Cuidados com a pele', description: 'Hidratação e proteção' },
      ],
    },
  ]

  return (
    <>
      <Header title="Rotinas" subtitle="Guias de desenvolvimento" />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {routines.map((routine) => (
          <div key={routine.id} className="bg-surface rounded-lg shadow-soft overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 flex items-center gap-3">
              <span className="text-3xl">{routine.icon}</span>
              <div>
                <h3 className="font-bold text-text-primary">{routine.category}</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {routine.items.map((item, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-primary-light/50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary text-sm">{item.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
