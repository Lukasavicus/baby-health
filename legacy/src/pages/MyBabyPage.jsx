import { useBaby } from '../context/BabyContext'
import { Header } from '../components/Header'
import { useEventStats, useTodayEvents } from '../hooks/useEvents'
import { Settings, Edit3, TrendingUp } from 'lucide-react'

export default function MyBabyPage() {
  const { baby } = useBaby()
  const todayEvents = useTodayEvents()
  const stats = useEventStats()

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()
    let days = today.getDate() - birth.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    return { years, months, days }
  }

  const age = calculateAge(baby.birthDate)

  return (
    <>
      <Header
        title="Meu Bebê"
        action={
          <button className="p-2 hover:bg-primary-light rounded-lg transition-colors">
            <Settings className="w-6 h-6 text-primary" />
          </button>
        }
      />

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-soft-lg p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{baby.name}</h1>
              <p className="text-primary-light text-sm mt-1">
                {age.years > 0
                  ? `${age.years} ano${age.years > 1 ? 's' : ''} e ${age.months} mês${age.months !== 1 ? 'es' : ''}`
                  : `${age.months} mês${age.months !== 1 ? 'es' : ''} e ${age.days} dia${age.days !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="text-5xl">👶</div>
          </div>

          <div className="divider border-white/20 my-4" />

          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{todayEvents.length}</p>
              <p className="text-xs text-primary-light">Eventos hoje</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.feeding.count}</p>
              <p className="text-xs text-primary-light">Alimentações</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.floor(stats.sleep.total / 60)}h</p>
              <p className="text-xs text-primary-light">Sono</p>
            </div>
          </div>
        </div>

        {/* Birthday Info */}
        <div className="bg-surface rounded-lg shadow-soft p-4">
          <p className="text-sm text-text-secondary mb-2">Data de nascimento</p>
          <p className="text-lg font-bold text-text-primary">
            {new Date(baby.birthDate).toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Weekly Report Preview */}
        <div className="bg-surface rounded-lg shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Relatório da Semana
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Alimentações</span>
              <span className="font-semibold text-text-primary">{stats.feeding.count * 7}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Horas de sono</span>
              <span className="font-semibold text-text-primary">{(stats.sleep.total * 7) / 60}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Fraldas</span>
              <span className="font-semibold text-text-primary">
                {(stats.diaper.wet + stats.diaper.dirty + stats.diaper.mixed) * 7}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Atividades</span>
              <span className="font-semibold text-text-primary">{stats.activities * 7}</span>
            </div>
          </div>
        </div>

        {/* Growth Section */}
        <div className="bg-surface rounded-lg shadow-soft p-4">
          <h3 className="font-bold text-text-primary mb-3">Crescimento</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary">Peso</span>
                <span className="font-semibold text-text-primary">-</span>
              </div>
              <div className="h-2 bg-border rounded-full" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-text-secondary">Comprimento</span>
                <span className="font-semibold text-text-primary">-</span>
              </div>
              <div className="h-2 bg-border rounded-full" />
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-3">
            Adicione medidas na próxima consulta ao pediatra
          </p>
        </div>

        {/* Settings Button */}
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          <Edit3 className="w-5 h-5" />
          Editar Informações
        </button>
      </div>
    </>
  )
}
