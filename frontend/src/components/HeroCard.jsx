export function HeroCard({ baby, stats }) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-soft-lg p-6 text-white mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{baby.name}</h1>
          <p className="text-primary-light text-sm">{baby.age}</p>
        </div>
        <div className="text-4xl">👶</div>
      </div>

      <div className="divider border-white/20 my-4" />

      <p className="text-primary-light text-sm mb-4 capitalize">{today}</p>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.feeding.count}</p>
          <p className="text-xs text-primary-light mt-1">Alimentações</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{Math.floor(stats.sleep.total / 60)}h</p>
          <p className="text-xs text-primary-light mt-1">Sono</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{stats.diaper.wet + stats.diaper.dirty + stats.diaper.mixed}</p>
          <p className="text-xs text-primary-light mt-1">Fraldas</p>
        </div>
      </div>
    </div>
  )
}
