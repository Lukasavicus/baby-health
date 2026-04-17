import { useBaby } from '../context/BabyContext'
import { useTodayEvents } from '../hooks/useEvents'
import { Header } from '../components/Header'
import { Plus, Share2 } from 'lucide-react'

export default function CaregiversPage() {
  const { baby } = useBaby()
  const todayEvents = useTodayEvents()

  const countByCaregiver = todayEvents.reduce((acc, event) => {
    const caregiver = event.caregiver || 'Desconhecido'
    acc[caregiver] = (acc[caregiver] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <Header
        title="Cuidadores"
        subtitle={`${baby.caregivers?.length || 0} cuidador(es)`}
        action={
          <button className="p-2 hover:bg-primary-light rounded-lg transition-colors">
            <Plus className="w-6 h-6 text-primary" />
          </button>
        }
      />

      <div className="px-4 py-4 max-w-md mx-auto">
        {/* Caregivers List */}
        <div className="space-y-3 mb-6">
          {baby.caregivers && baby.caregivers.length > 0 ? (
            baby.caregivers.map((caregiver, idx) => (
              <div
                key={idx}
                className="bg-surface rounded-lg shadow-soft p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-2xl">
                    {caregiver.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text-primary">{caregiver.name}</p>
                    <p className="text-xs text-text-secondary">{caregiver.role}</p>
                    {countByCaregiver[caregiver.name] && (
                      <p className="text-xs text-primary font-semibold mt-1">
                        {countByCaregiver[caregiver.name]} registro(s) hoje
                      </p>
                    )}
                  </div>
                </div>
                <button className="p-2 hover:bg-primary-light rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">Nenhum cuidador adicionado</p>
            </div>
          )}
        </div>

        {/* Shared Timeline */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-3">Atividade de hoje</h2>
          <div className="space-y-2">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div key={event.id} className="bg-surface rounded-lg shadow-soft p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">
                        {event.caregiver || 'Desconhecido'} registrou {event.type}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {new Date(event.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-2xl">
                      {{
                        feeding: '🍼',
                        sleep: '😴',
                        diaper: '👶',
                        hydration: '💧',
                        activity: '⭐',
                      }[event.type] || '📝'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-text-secondary py-8">Nenhum registro hoje</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
