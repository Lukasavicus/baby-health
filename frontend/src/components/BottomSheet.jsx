import { X } from 'lucide-react'
import { useEffect } from 'react'

export function BottomSheet({ isOpen, onClose, title, children, maxHeight = '90vh' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-2xl shadow-soft-lg z-50 animate-slide-up"
        style={{ maxHeight }}
      >
        <div className="sticky top-0 bg-surface border-b border-border px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
        <div className="overflow-y-auto p-4" style={{ maxHeight: `calc(${maxHeight} - 60px)` }}>
          {children}
        </div>
      </div>
    </>
  )
}
