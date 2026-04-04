# BabyHealth - Quick Start Guide

## 30-Second Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and see the demo!

## What You'll See

- Demo baby "Sophia" (45 days old)
- 5 pre-loaded events for today
- All 4 pages fully functional
- Offline storage working

## First Things to Try

1. **Add an event**: Click the blue "+" button
2. **See the timer**: Go to feeding, try the sleep timer
3. **View stats**: Check daily summary cards
4. **Explore pages**: Click through all 4 tabs
5. **Delete an event**: Click trash icon on any event

## File You Need to Edit

### To connect your API:

Edit `.env`:
```env
VITE_API_BASE_URL=http://your-api.com/api
```

### To change baby's name:

Edit `src/api/client.js`:
```javascript
mockBaby.name = 'Your Baby Name'
```

### To customize colors:

Edit `tailwind.config.js`:
```javascript
primary: '#YourColor'
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/         ← 4 pages (Hoje, Cuidadores, etc)
│   ├── components/    ← Reusable UI pieces
│   ├── sheets/        ← Forms for logging events
│   ├── context/       ← Global state management
│   ├── hooks/         ← Custom logic (timer, stats)
│   └── api/           ← API client & demo data
├── public/            ← PWA manifest & service worker
└── index.html         ← Entry point
```

## 5 Pages

| Tab | Component | Features |
|-----|-----------|----------|
| **Hoje** | HomePage | Daily stats, 6 cards, timeline |
| **Cuidadores** | CaregiversPage | Caregiver list, activity feed |
| **Rotinas** | RoutinesPage | 4 routine categories with tips |
| **Meu Bebê** | MyBabyPage | Baby profile, weekly stats |

## 5 Quick Log Types

| Type | Form | Presets |
|------|------|---------|
| **Alimentação** | Mamadeira/Amamentação/Sólidos | 30-150ml |
| **Sono** | Timer + duration | 15-90min |
| **Fraldas** | Wet/Dirty/Mixed | - |
| **Hidratação** | Water/Juice/Other | 30-200ml |
| **Atividade** | 5 types + duration | 5-30min |

## Key Features

- Real-time statistics
- Sleep timer
- Offline support
- localStorage persistence
- PWA installable
- Mobile responsive
- Beautiful animations

## Available Commands

```bash
npm run dev       # Start development (port 5173)
npm run build     # Create production build
npm run preview   # Preview production build
npm run lint      # Check code (if configured)
```

## Color Palette

```
Primary Purple:  #7C6FEB
Secondary Pink:  #FF8FAB
Accent Teal:     #6DD5C4
Warning Orange:  #FFB86C
Success Green:   #8BD5A0
```

## Component Exports

Every component is ready to use:

```javascript
// Pages
<HomePage />
<CaregiversPage />
<RoutinesPage />
<MyBabyPage />

// Sheets
<FeedingSheet />
<SleepSheet />
<DiaperSheet />
<HydrationSheet />
<ActivitySheet />

// Components
<TrackerCard />
<HeroCard />
<Timeline />
<EventItem />
<Badge />
<Chip />
<ProgressBar />
<EmptyState />
```

## State Management

```javascript
import { useBaby } from './context/BabyContext'

const { baby, events, addEvent, deleteEvent } = useBaby()
```

## Hooks

```javascript
import { useTodayEvents, useEventStats, useRelativeTime } from './hooks/useEvents'
import { useTimer } from './hooks/useTimer'

const events = useTodayEvents()
const stats = useEventStats()
const timeAgo = useRelativeTime(date)
const timer = useTimer()
```

## API Calls

```javascript
import { apiClient } from './api/client'

const events = await apiClient.getEvents(babyId)
const event = await apiClient.createEvent(babyId, {...})
await apiClient.updateEvent(babyId, eventId, {...})
await apiClient.deleteEvent(babyId, eventId)
```

## Offline Mode

The app works completely offline:
- Events save to localStorage
- All features available
- Syncs when API returns
- No data loss

## Testing Offline

1. Open DevTools (F12)
2. Network tab → Offline
3. App still works normally!

## Deploy to Vercel

```bash
vercel
# Then set environment:
# VITE_API_BASE_URL=https://your-api.com/api
```

## Deploy to Netlify

```bash
npm run build
# drag dist/ folder to netlify.com
# or: netlify deploy --prod --dir=dist
```

## Common Questions

**Q: Where's the database?**
A: Use localStorage for now, add backend API when ready

**Q: How do I add more caregivers?**
A: Edit `mockBaby.caregivers` in `src/api/client.js`

**Q: Can I change the baby's age?**
A: Edit `mockBaby.birthDate` in `src/api/client.js`

**Q: How do I add a new tracker card?**
A: Add `<TrackerCard />` to `HomePage.jsx` grid

**Q: How do I change colors?**
A: Edit color values in `tailwind.config.js`

**Q: Does it work offline?**
A: Yes! Fully offline-first with localStorage

**Q: Can I install it as an app?**
A: Yes! Add to home screen on mobile

**Q: How big is the bundle?**
A: ~150KB gzipped (very fast)

## File Count

- 34 React files (components, pages, hooks, context)
- 4 config files (vite, tailwind, postcss, eslint-ready)
- 3 docs (README, SETUP, FEATURES)
- ~3,500 lines of production code

## Next Steps

1. ✅ Install: `npm install`
2. ✅ Run: `npm run dev`
3. ✅ Explore the demo
4. ⬜ Connect your API in `.env`
5. ⬜ Deploy to hosting
6. ⬜ Add photo upload
7. ⬜ Add real-time sync

## Still Have Questions?

- **Installation**: See SETUP.md
- **Features**: See FEATURES.md
- **Full Docs**: See README.md
- **Code**: Comments in each file

## Keyboard Shortcuts

- **Tab**: Navigate between buttons
- **Enter**: Click focused button
- **Escape**: Close bottom sheet

## Mobile Testing

```bash
# Get local IP:
# Mac: ifconfig | grep inet
# Windows: ipconfig | findstr IPv4

# Then visit:
# http://YOUR_IP:5173
```

## Production Checklist

- [ ] Update VITE_API_BASE_URL
- [ ] Test all features
- [ ] Run `npm run build`
- [ ] Test on real device
- [ ] Deploy dist/ folder
- [ ] Test PWA install
- [ ] Monitor with analytics

## Performance Tips

1. Images: Keep them small
2. API: Add pagination to timeline
3. State: Keep baby context lean
4. Storage: Clean old events monthly
5. Bundle: Monitor with `npm run build`

## Browser Support

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

---

**Ready to go!** Just run `npm install && npm run dev`

More help:
- Full docs: README.md
- Setup guide: SETUP.md
- Features: FEATURES.md
