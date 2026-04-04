import { useBaby } from '../context/BabyContext'
import { useTodayEvents, useEventStats } from '../hooks/useEvents'
import { HeroCard } from '../components/HeroCard'
import { TrackerCard } from '../components/TrackerCard'
import { Timeline } from '../components/Timeline'
import {
  Bottle,
  Droplets,
  Moon,
  Sun,
  Baby,
  Star,
} from 'lucide-react'

export default function HomePage() {
  const { baby, deleteEvent } = useBaby()
  const todayEvents = useTodayEvents()
  const stats = useEventStats()

  return (
    <div className="px-4 py-4 max-w-md mx-auto">
      <HeroCard baby={baby} stats={stats} />

      {/* Tracker Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <TrackerCard
          icon={Bottle}
          title="Alimentação"
          value={stats.feeding.count}
          unit="vezes"
          description={
            stats.feeding.lastTime
              ? `Última: ${new Date(stats.feeding.lastTime).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Nenhuma ainda'
          }
          color="secondary"
        />

        <TrackerCard
          icon={Droplets}
          title="Hidratação"
          value={stats.hydration.total}
          unit="ml"
          color="primary"
        />

        <TrackerCard
          icon={Moon}
          title="Sono"
          value={Math.floor(stats.sleep.total / 60)}
          unit="h"
          secondaryValue={`${stats.sleep.total % 60}min`}
          color="warning"
        />

        <TrackerCard
          icon={Sun}
          title="Acordado"
          value={todayEvents.length}
          unit="eventos"
          color="accent"
        />

        <TrackerCard
          icon={Baby}
          title="Fraldas"
          value={stats.diaper.wet + stats.diaper.dirty + stats.diaper.mixed}
          unit="total"
          secondaryValue={`${stats.diaper.wet} molhada(s) • ${stats.diaper.dirty} suja(s)`}
          color="accent"
        />

        <TrackerCard
          icon={Star}
          title="Atividades"
          value={stats.activities}
          unit="feitas"
          color="success"
        />
      </div>

      {/* Timeline Section */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-text-primary mb-3">Registros de hoje</h2>
        <Timeline events={todayEvents} onDelete={deleteEvent} />
      </div>
    </div>
  )
}
