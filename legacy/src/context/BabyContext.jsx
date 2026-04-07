import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { apiClient, mockBaby, mockEvents } from '../api/client'

const BabyContext = createContext()

const initialState = {
  baby: mockBaby,
  events: mockEvents,
  loading: false,
  error: null,
  useOfflineMode: true,
}

function babyReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_BABY':
      return { ...state, baby: action.payload }
    case 'SET_EVENTS':
      return { ...state, events: action.payload }
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] }
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((e) => (e.id === action.payload.id ? action.payload : e)),
      }
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.payload),
      }
    case 'SET_OFFLINE_MODE':
      return { ...state, useOfflineMode: action.payload }
    default:
      return state
  }
}

export function BabyProvider({ children }) {
  const [state, dispatch] = useReducer(babyReducer, initialState)

  // Initialize from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('babyhealth_state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        dispatch({ type: 'SET_BABY', payload: parsed.baby })
        dispatch({ type: 'SET_EVENTS', payload: parsed.events })
      } catch (e) {
        console.error('Failed to load state from localStorage:', e)
      }
    }

    // Try to sync with API
    syncWithAPI()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(
      'babyhealth_state',
      JSON.stringify({
        baby: state.baby,
        events: state.events,
      })
    )
  }, [state.baby, state.events])

  const syncWithAPI = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const [baby, events] = await Promise.all([
        apiClient.getBaby(state.baby.id),
        apiClient.getEvents(state.baby.id),
      ])
      dispatch({ type: 'SET_BABY', payload: baby })
      dispatch({ type: 'SET_EVENTS', payload: events })
      dispatch({ type: 'SET_OFFLINE_MODE', payload: false })
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      console.log('Using offline mode:', error)
      dispatch({ type: 'SET_OFFLINE_MODE', payload: true })
      dispatch({ type: 'SET_ERROR', payload: 'Using local data' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.baby.id])

  const addEvent = useCallback(
    async (event) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        // Add timestamp if not present
        const eventData = {
          ...event,
          timestamp: event.timestamp || new Date(),
        }

        if (state.useOfflineMode) {
          // Generate ID for offline mode
          const id = Math.random().toString(36).substr(2, 9)
          const newEvent = { ...eventData, id }
          dispatch({ type: 'ADD_EVENT', payload: newEvent })
          return newEvent
        } else {
          const newEvent = await apiClient.createEvent(state.baby.id, eventData)
          dispatch({ type: 'ADD_EVENT', payload: newEvent })
          return newEvent
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        // Fallback to offline mode
        const id = Math.random().toString(36).substr(2, 9)
        const newEvent = { ...event, id, timestamp: event.timestamp || new Date() }
        dispatch({ type: 'ADD_EVENT', payload: newEvent })
        return newEvent
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [state.baby.id, state.useOfflineMode]
  )

  const updateEvent = useCallback(
    async (eventId, event) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        if (state.useOfflineMode) {
          const updatedEvent = { ...event, id: eventId }
          dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent })
          return updatedEvent
        } else {
          const updatedEvent = await apiClient.updateEvent(state.baby.id, eventId, event)
          dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent })
          return updatedEvent
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        const updatedEvent = { ...event, id: eventId }
        dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent })
        return updatedEvent
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [state.baby.id, state.useOfflineMode]
  )

  const deleteEvent = useCallback(
    async (eventId) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        if (!state.useOfflineMode) {
          await apiClient.deleteEvent(state.baby.id, eventId)
        }
        dispatch({ type: 'DELETE_EVENT', payload: eventId })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        dispatch({ type: 'DELETE_EVENT', payload: eventId })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [state.baby.id, state.useOfflineMode]
  )

  const updateBaby = useCallback(
    async (baby) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        if (state.useOfflineMode) {
          dispatch({ type: 'SET_BABY', payload: baby })
          return baby
        } else {
          const updatedBaby = await apiClient.updateBaby(state.baby.id, baby)
          dispatch({ type: 'SET_BABY', payload: updatedBaby })
          return updatedBaby
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        dispatch({ type: 'SET_BABY', payload: baby })
        return baby
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [state.baby.id, state.useOfflineMode]
  )

  const value = {
    ...state,
    addEvent,
    updateEvent,
    deleteEvent,
    updateBaby,
    syncWithAPI,
  }

  return <BabyContext.Provider value={value}>{children}</BabyContext.Provider>
}

export function useBaby() {
  const context = useContext(BabyContext)
  if (!context) {
    throw new Error('useBaby must be used within BabyProvider')
  }
  return context
}
