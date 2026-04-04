import { Plus } from 'lucide-react'

export function FloatingAction({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-soft-lg hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center z-30"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
