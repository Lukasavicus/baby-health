# BabyHealth Frontend

A beautiful, Samsung Health-inspired baby tracking PWA built with React 18 and Vite.

## Features

- Track baby's daily activities (feeding, sleep, diapers, hydration, activities)
- Real-time sleep timer with automatic duration calculation
- Offline-first PWA with local storage fallback
- Responsive mobile design (optimized for max 430px width)
- Beautiful pastel light theme with smooth animations
- Multi-caregiver support with activity tracking
- Weekly reports and statistics
- Guided routines and development tips

## Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling with custom Samsung Health-inspired palette
- **Lucide React** - Icons
- **Recharts** - Charts and graphs (ready for implementation)
- **Context API + useReducer** - State management

## Quick Start

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### Build

```bash
npm run build
```

Output will be in the `dist/` folder.

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=BabyHealth
```

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API client and mock data
│   ├── components/    # Reusable UI components
│   ├── context/       # React Context for state
│   ├── hooks/         # Custom hooks (useEvents, useTimer)
│   ├── pages/         # Page components
│   ├── sheets/        # Bottom sheet forms for logging
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles with Tailwind
├── public/
│   ├── manifest.json  # PWA manifest
│   └── sw.js          # Service worker
└── package.json       # Dependencies
```

## Pages

### 1. HomePage (Hoje)
- Daily summary card with key stats
- 6 tracker cards: Alimentação, Hidratação, Sono, Tempo Acordado, Fraldas, Atividades
- Timeline of today's events
- Quick access to edit/delete entries

### 2. CaregiversPage
- List of caregivers with activity count
- Shared activity feed showing who logged what
- Add caregiver button

### 3. RoutinesPage
- Categorized routines: Sono, Alimentação, Desenvolvimento, Higiene
- Guided tips for each routine
- Samsung Health-inspired content cards

### 4. MyBabyPage
- Baby profile with age calculation
- Weekly stats preview
- Growth tracking section (placeholder)
- Edit profile button

## Quick Log Sheet

Floating action button opens a modal with quick logging options:
- **Alimentação** - Feeding (mamadeira, amamentação, sólidos)
- **Sono** - Sleep with timer
- **Fraldas** - Diaper tracking (wet, dirty, mixed)
- **Hidratação** - Water/liquid intake
- **Atividade** - Activities (tummy time, reading, play, walks, bath)

## Components

### Core Components
- `Layout.jsx` - Main layout with bottom nav and floating action
- `BottomNav.jsx` - 4-tab navigation
- `FloatingAction.jsx` - Floating "+" button
- `Header.jsx` - Page headers

### Content Components
- `TrackerCard.jsx` - Stats cards with icons and progress
- `HeroCard.jsx` - Daily summary card
- `Timeline.jsx` - Event list
- `EventItem.jsx` - Individual event in timeline

### Form Components (Bottom Sheets)
- `QuickLogSheet.jsx` - Category selector
- `FeedingSheet.jsx` - Feeding options
- `SleepSheet.jsx` - Sleep with timer
- `DiaperSheet.jsx` - Diaper type picker
- `HydrationSheet.jsx` - Liquid intake
- `ActivitySheet.jsx` - Activity selector

### UI Components
- `Badge.jsx` - Status badges
- `Chip.jsx` - Selection chips
- `ProgressBar.jsx` - Progress indicators
- `EmptyState.jsx` - Empty state placeholders
- `BottomSheet.jsx` - Slide-up modal

## State Management

Using `BabyContext` with `useReducer`:

```javascript
const { baby, events, addEvent, updateEvent, deleteEvent, updateBaby } = useBaby()
```

### Features
- Automatic localStorage persistence
- Fallback to offline mode if API unavailable
- Optimistic updates
- Demo data on first load

## Hooks

### useEvents
- `useEvents(filter)` - Filtered events
- `useTodayEvents()` - Today's events
- `useEventStats()` - Aggregated statistics
- `useRelativeTime(date)` - "2h ago" format

### useTimer
- Timer with start/pause/reset
- Seconds counter
- Formatted time display

## Styling

### Colors (Pastel Light)
- Primary: #7C6FEB (soft purple)
- Secondary: #FF8FAB (soft pink)
- Accent: #6DD5C4 (soft teal)
- Warning: #FFB86C (soft orange)
- Success: #8BD5A0 (soft green)
- Background: #F8F7FC
- Surface: #FFFFFF

### Key CSS Classes
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Basic card
- `.card-interactive` - Clickable card
- `.input` - Form input
- `.badge` - Badge
- `.divider` - Horizontal divider

## API Integration

The app uses a configurable API client that connects to the backend:

```javascript
import { apiClient } from './api/client'

// Fetch events
const events = await apiClient.getEvents(babyId)

// Create event
const event = await apiClient.createEvent(babyId, {
  type: 'feeding',
  category: 'mamadeira',
  amount: 120,
  timestamp: new Date(),
})
```

### Offline Mode
If the API is unavailable, the app automatically falls back to localStorage and continues functioning without cloud sync.

## PWA Features

- Installable on mobile devices
- Offline support via Service Worker
- Web App Manifest
- Home screen icon
- Standalone mode

## Development Tips

### Adding a New Page
1. Create file in `src/pages/PageName.jsx`
2. Import in `App.jsx`
3. Add route in `<Routes>`
4. Add tab to `BottomNav.jsx`

### Adding a New Sheet
1. Create file in `src/sheets/SheetName.jsx`
2. Add case in `QuickLogSheet.jsx`
3. Import the sheet in `QuickLogSheet`

### Styling
- Use Tailwind classes primarily
- Custom colors defined in `tailwind.config.js`
- Animations in `keyframes`
- Responsive: mobile-first, max-width 430px

## Browser Support

- Modern browsers (Chrome, Safari, Firefox, Edge)
- iOS 12+ for PWA
- Android 5+ for Chrome

## Performance

- Code splitting with React Router
- Lazy image loading
- Optimized bundle with Vite
- Service worker for offline caching
- Local storage for instant loads

## Future Enhancements

- [ ] Charts and graphs with Recharts
- [ ] Photo upload for baby profile
- [ ] Notifications for feeding schedules
- [ ] Doctor's appointment tracking
- [ ] Vaccine timeline
- [ ] Milestone tracking
- [ ] Export reports as PDF
- [ ] Multi-language support

## License

MIT
