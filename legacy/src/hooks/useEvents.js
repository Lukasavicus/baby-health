import { useBaby } from '../context/BabyContext'
import { useMemo } from 'react'

export function useEvents(filter = null) {
  const { events } = useBaby()

  return useMemo(() => {
    if (!filter) return events

    return events.filter((event) => {
      if (filter.type && event.type !== filter.type) return false
      if (filter.date) {
        const eventDate = new Date(event.timestamp).toLocaleDateString()
        const filterDate = new Date(filter.date).toLocaleDateString()
        if (eventDate !== filterDate) return false
      }
      if (filter.category && event.category !== filter.category) return false
      return true
    })
  }, [events, filter])
}

export function useTodayEvents() {
  const { events } = useBaby()
  const today = new Date().toLocaleDateString()

  return useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.timestamp).toLocaleDateString()
      return eventDate === today
    })
  }, [events])
}

export function useEventStats() {
  const todayEvents = useTodayEvents()

  return useMemo(() => {
    const stats = {
      feeding: {
        count: 0,
        total: 0,
        lastTime: null,
      },
      sleep: {
        total: 0,
        count: 0,
        lastTime: null,
      },
      hydration: {
        total: 0,
        count: 0,
      },
      diaper: {
        wet: 0,
        dirty: 0,
        mixed: 0,
      },
      activities: 0,
    }

    todayEvents.forEach((event) => {
      switch (event.type) {
        case 'feeding':
          stats.feeding.count++
          if (event.amount) stats.feeding.total += event.amount
          stats.feeding.lastTime = event.timestamp
          break
        case 'sleep':
          stats.sleep.count++
          stats.sleep.total += event.duration || 0
          stats.sleep.lastTime = event.timestamp
          break
        case 'hydration':
          stats.hydration.count++
          if (event.amount) stats.hydration.total += event.amount
          break
        case 'diaper':
          if (event.category === 'wet') stats.diaper.wet++
          else if (event.category === 'dirty') stats.diaper.dirty++
          else if (event.category === 'mixed') stats.diaper.mixed++
          break
        case 'activity':
          stats.activities++
          break
      }
    })

    return stats
  }, [todayEvents])
}

export function useRelativeTime(date) {
  return useMemo(() => {
    const now = new Date()
    const eventDate = new Date(date)
    const diffMs = now - eventDate
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `há ${diffMins}m`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays < 7) return `há ${diffDays}d`

    return eventDate.toLocaleDateString('pt-BR')
  }, [date])
}
