import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Zap, Baby } from 'lucide-react'

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { id: 'home', label: 'Hoje', path: '/', icon: Home },
    { id: 'caregivers', label: 'Cuidadores', path: '/cuidadores', icon: Users },
    { id: 'routines', label: 'Rotinas', path: '/rotinas', icon: Zap },
    { id: 'baby', label: 'Meu Bebê', path: '/meu-bebe', icon: Baby },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border shadow-soft-lg z-40">
      <div className="flex items-center justify-around max-w-md mx-auto h-20">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
