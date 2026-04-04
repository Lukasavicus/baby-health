const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // Events
  async getEvents(babyId, filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/babies/${babyId}/events?${params}`)
  }

  async createEvent(babyId, event) {
    return this.request(`/babies/${babyId}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    })
  }

  async updateEvent(babyId, eventId, event) {
    return this.request(`/babies/${babyId}/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    })
  }

  async deleteEvent(babyId, eventId) {
    return this.request(`/babies/${babyId}/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  // Babies
  async getBaby(babyId) {
    return this.request(`/babies/${babyId}`)
  }

  async getBabies() {
    return this.request('/babies')
  }

  async createBaby(baby) {
    return this.request('/babies', {
      method: 'POST',
      body: JSON.stringify(baby),
    })
  }

  async updateBaby(babyId, baby) {
    return this.request(`/babies/${babyId}`, {
      method: 'PUT',
      body: JSON.stringify(baby),
    })
  }

  // Analytics
  async getAnalytics(babyId, period = 'day') {
    return this.request(`/babies/${babyId}/analytics?period=${period}`)
  }

  // Reports
  async getReport(babyId, type = 'weekly') {
    return this.request(`/babies/${babyId}/reports/${type}`)
  }
}

export const apiClient = new APIClient()

// Mock data for development/fallback
export const mockBaby = {
  id: '1',
  name: 'Sophia',
  birthDate: new Date(new Date().setDate(new Date().getDate() - 45)), // 45 days old
  age: '1 mês e 15 dias',
  photo: null,
  caregivers: [
    { id: '1', name: 'Mamãe', role: 'Parent', avatar: '👩' },
    { id: '2', name: 'Papai', role: 'Parent', avatar: '👨' },
  ],
}

export const mockEvents = [
  {
    id: '1',
    type: 'feeding',
    category: 'mamadeira',
    amount: 120,
    unit: 'ml',
    feedingType: 'formula',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    caregiver: 'Mamãe',
  },
  {
    id: '2',
    type: 'diaper',
    category: 'wet',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    caregiver: 'Papai',
  },
  {
    id: '3',
    type: 'sleep',
    duration: 90, // minutes
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    category: 'nap',
    caregiver: 'Mamãe',
  },
  {
    id: '4',
    type: 'feeding',
    category: 'amamentação',
    timestamp: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    caregiver: 'Mamãe',
    duration: 15,
  },
  {
    id: '5',
    type: 'activity',
    category: 'tummy_time',
    duration: 10,
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    caregiver: 'Papai',
  },
]
