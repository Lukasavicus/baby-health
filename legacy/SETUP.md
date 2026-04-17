# BabyHealth Frontend - Setup Guide

## Installation & Setup

### Prerequisites
- Node.js 16+ or newer
- npm or yarn

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

This installs:
- React 18
- React Router v6
- Tailwind CSS
- Lucide React (icons)
- Recharts (for future graphs)
- Vite (build tool)

### Step 2: Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` to match your setup:

```env
# Local API server
VITE_API_BASE_URL=http://localhost:8080/api

# Production example
# VITE_API_BASE_URL=https://api.babyhealth.com/api
```

### Step 3: Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 4: Build for Production

```bash
npm run build
```

Output in `dist/` folder. Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Your own server

## Project Structure Overview

```
frontend/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind customization
├── postcss.config.js            # PostCSS setup
│
├── public/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker for offline support
│
├── src/
│   ├── main.jsx                 # App bootstrap
│   ├── App.jsx                  # Root component with routes
│   ├── index.css                # Global styles + Tailwind directives
│   │
│   ├── api/
│   │   └── client.js            # API service + mock data
│   │
│   ├── context/
│   │   └── BabyContext.jsx      # Global state with useReducer
│   │
│   ├── hooks/
│   │   ├── useEvents.js         # Event filtering & stats
│   │   └── useTimer.js          # Sleep timer functionality
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── BottomNav.jsx        # 4-tab navigation
│   │   ├── FloatingAction.jsx   # Floating "+" button
│   │   ├── BottomSheet.jsx      # Slide-up modal
│   │   ├── Header.jsx           # Page headers
│   │   ├── TrackerCard.jsx      # Stats cards
│   │   ├── HeroCard.jsx         # Daily summary
│   │   ├── Timeline.jsx         # Event list
│   │   ├── EventItem.jsx        # Event row
│   │   ├── Badge.jsx            # Status badges
│   │   ├── Chip.jsx             # Selection buttons
│   │   ├── ProgressBar.jsx      # Progress indicators
│   │   └── EmptyState.jsx       # Empty state UI
│   │
│   ├── pages/                   # Full page components
│   │   ├── HomePage.jsx         # Hoje tab
│   │   ├── CaregiversPage.jsx   # Cuidadores tab
│   │   ├── RoutinesPage.jsx     # Rotinas tab
│   │   └── MyBabyPage.jsx       # Meu Bebé tab
│   │
│   └── sheets/                  # Bottom sheet forms
│       ├── QuickLogSheet.jsx    # Category selector
│       ├── FeedingSheet.jsx     # Feeding form
│       ├── SleepSheet.jsx       # Sleep + timer
│       ├── DiaperSheet.jsx      # Diaper tracking
│       ├── HydrationSheet.jsx   # Liquid intake
│       └── ActivitySheet.jsx    # Activity logging
│
├── .env.example                 # Environment template
├── .env.development             # Dev environment
├── .gitignore                   # Git ignore rules
└── README.md                    # Full documentation
```

## Key Features

### 1. Pages (4 Tabs)

**HomePage (Hoje)**
- Daily summary with stats
- 6 tracker cards in grid
- Timeline of events with delete option
- Real-time stats aggregation

**CaregiversPage (Cuidadores)**
- List of caregivers with activity count
- Shared activity feed
- Who logged what indicator
- Add caregiver button

**RoutinesPage (Rotinas)**
- 4 routine categories: Sono, Alimentação, Desenvolvimento, Higiene
- Guided tips and routines
- Samsung Health-inspired content cards

**MyBabyPage (Meu Bebé)**
- Baby profile with photo placeholder
- Age calculation (years/months/days)
- Weekly stats preview
- Growth tracking section
- Edit profile button

### 2. Quick Log Sheet (Floating Action Button)

Modal opens with 5 categories:

**Alimentação (Feeding)**
- Mamadeira: Amount (ml) + milk type (formula/breastmilk)
- Amamentação: Basic or advanced mode (sides, timer)
- Sólidos: Basic food entry
- Quick presets: 30, 60, 90, 120, 150ml

**Sono (Sleep)**
- Type: Cochilo (nap) or Noturno (night)
- Timer: Start/pause/reset with auto-save
- Or manual duration input
- Quick presets: 15, 30, 45, 60, 90 minutes

**Fraldas (Diaper)**
- Type picker: Molhada (wet), Suja (dirty), Molhada e Suja (mixed)
- Optional notes field
- Emoji indicators

**Hidratação (Hydration)**
- Type: Água (water), Suco (juice), Outro (other)
- Amount in ml
- Quick presets: 30, 60, 90, 120, 150, 200ml

**Atividade (Activity)**
- 5 types: Barriga (tummy), Leitura (reading), Brincadeira (play), Passeio (walk), Banho (bath)
- Optional duration
- Optional notes
- Quick presets: 5, 10, 15, 20, 30 minutes

### 3. State Management

Using React Context + useReducer:

```javascript
// In any component:
const { baby, events, addEvent, updateEvent, deleteEvent, updateBaby } = useBaby()

// Add event
await addEvent({
  type: 'feeding',
  category: 'mamadeira',
  amount: 120,
  timestamp: new Date(),
  caregiver: 'Mamãe'
})

// Delete event
await deleteEvent(eventId)

// Update baby info
await updateBaby({ name: 'Sophia', age: '1 mês' })
```

### 4. Custom Hooks

**useEvents(filter)**
- Filter events by type, date, category
- Returns filtered array
- Memoized for performance

**useTodayEvents()**
- Only today's events
- Used throughout for daily stats

**useEventStats()**
- Aggregated statistics
- Counts by type
- Last times
- Total amounts

**useRelativeTime(date)**
- Converts to "2h ago" format
- Updates automatically

**useTimer(initialSeconds, isActive)**
- Timer with start/pause/reset
- Formats as HH:MM:SS
- Used for sleep tracking

### 5. Offline Support

- Automatic localStorage persistence
- Falls back to offline mode if API unavailable
- Service Worker for static asset caching
- Works fully offline with local data
- Syncs when connection returns

### 6. Colors & Styling

All colors in `tailwind.config.js`:

```javascript
primary: '#7C6FEB'           // Main purple
primary-light: '#EDE9FF'     // Light purple
secondary: '#FF8FAB'         // Pink
accent: '#6DD5C4'            // Teal
warning: '#FFB86C'           // Orange
success: '#8BD5A0'           // Green
background: '#F8F7FC'        // Page bg
surface: '#FFFFFF'           // Card bg
text-primary: '#2D2B3D'      // Main text
text-secondary: '#8E8CA0'    // Secondary text
border: '#E8E6F0'            // Border color
```

### 7. API Integration

Configured API client in `src/api/client.js`:

```javascript
import { apiClient } from './api/client'

// All these methods available:
apiClient.getEvents(babyId, filters)
apiClient.createEvent(babyId, eventData)
apiClient.updateEvent(babyId, eventId, eventData)
apiClient.deleteEvent(babyId, eventId)
apiClient.getBaby(babyId)
apiClient.updateBaby(babyId, babyData)
apiClient.getAnalytics(babyId, period)
apiClient.getReport(babyId, type)
```

### 8. Demo Data

Pre-loaded mock data for development:

```javascript
// In api/client.js:
mockBaby = {
  id: '1',
  name: 'Sophia',
  birthDate: // 45 days ago
  age: '1 mês e 15 dias',
  caregivers: [
    { id: '1', name: 'Mamãe', role: 'Parent' },
    { id: '2', name: 'Papai', role: 'Parent' }
  ]
}

// 5 mock events:
- Feeding 2h ago (120ml formula)
- Diaper 1h ago (wet)
- Sleep 3h ago (90 min nap)
- Feeding 4.5h ago (breastfeeding)
- Activity 6h ago (tummy time)
```

## Development Workflow

### Running Locally

```bash
# Terminal 1: Frontend
cd frontend
npm run dev
# App at http://localhost:5173

# Terminal 2: Backend (if available)
cd backend
# Your backend startup command
# API at http://localhost:8080/api
```

### Making Changes

1. **Add new component**: Create in `src/components/`
2. **Add new page**: Create in `src/pages/` + add route in `App.jsx`
3. **Add new sheet**: Create in `src/sheets/` + handle in `QuickLogSheet.jsx`
4. **Change colors**: Edit `tailwind.config.js`
5. **Add fonts/styles**: Edit `src/index.css`

### Testing Offline Mode

1. Open DevTools (F12)
2. Go to Network tab
3. Set throttling to Offline
4. App still works with cached data + localStorage

### Building & Deploying

```bash
# Build
npm run build

# Test production build locally
npm run preview
# Then deploy dist/ folder to hosting

# Vercel (recommended)
vercel
# or use web interface

# Netlify
netlify deploy --prod --dir=dist
```

## Browser DevTools Tips

### React DevTools
- Install React DevTools extension
- Inspect components
- View Context values
- Trace re-renders

### Tailwind IntelliSense
- Install VS Code extension
- Autocomplete for class names
- Color previews

### Network Tab
- See API calls
- Check response times
- Test offline mode

## Common Issues & Solutions

### "Cannot find module 'react'"
```bash
npm install
```

### API connection fails
1. Check `.env` VITE_API_BASE_URL
2. Verify backend is running
3. Check for CORS issues
4. App falls back to offline mode

### Styles not updating
1. Save CSS file
2. Vite hot reload should trigger
3. Refresh if needed
4. Check Tailwind config

### Build is slow
- First build is normal (creating cache)
- Subsequent builds are fast
- Check disk space
- Close other apps

## Customization Guide

### Change Baby's Name
```javascript
// In src/api/client.js mockBaby
mockBaby.name = 'Your Baby Name'
```

### Adjust Mobile Width
```javascript
// In tailwind.config.js max-w-md = 28rem (448px)
// Change all max-w-md to max-w-sm (24rem) or max-w-lg
```

### Add New Tracker Card
```javascript
// In HomePage.jsx, add to grid:
<TrackerCard
  icon={YourIcon}
  title="Your Title"
  value={value}
  unit="unit"
  color="primary"
/>
```

### Change Colors
```javascript
// In tailwind.config.js theme.extend.colors
primary: '#YourColor',
```

## Production Checklist

- [ ] Set `VITE_API_BASE_URL` to production API
- [ ] Remove mock data or gate it
- [ ] Test all features offline
- [ ] Test on real mobile device
- [ ] Check PWA manifest
- [ ] Set proper meta tags in index.html
- [ ] Enable HTTPS
- [ ] Set up CI/CD pipeline
- [ ] Monitor errors with Sentry/LogRocket
- [ ] Performance audit with Lighthouse

## Performance Tips

1. **Images**: Optimize before adding
2. **Fonts**: Load from Google Fonts CDN (add to index.html head)
3. **Code Splitting**: React Router does this automatically
4. **Caching**: Service Worker caches static assets
5. **Bundle Size**: Monitor with `npm run build` output

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:5173
4. Try the demo with pre-loaded data
5. Click floating + button to add events
6. Explore all 4 pages
7. Test offline mode
8. Connect to your backend API when ready

## Support

For issues:
1. Check console errors (F12)
2. Check browser Network tab
3. Review code comments in each file
4. Check README.md for detailed feature info
