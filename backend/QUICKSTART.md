# BabyHealth API - Quick Start Guide

Get the BabyHealth API up and running in 5 minutes.

## Prerequisites
- Python 3.8+
- pip

## Installation

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server
```bash
python main.py
```

By default the UI bootstrap is **empty** (no merge from `backend/ui_app_defaults/*.json`). For the app-design demo with catalogs and trackers, run:

```bash
BABYHEALTH_USE_UI_SEED=1 python main.py
```

Or from the repo root: `npm run dev-api-seed`.

You should see:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete [0.00s]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Using the API

### Access API Documentation
Open your browser and visit:
- **Swagger UI**: http://localhost:8000/docs
- **Interactive API explorer** with try-it-out buttons

### Seed Demo Data
Create a demo baby and events:

```bash
curl -X POST http://localhost:8000/api/setup/seed
```

Response:
```json
{
  "message": "Demo data seeded successfully",
  "baby_id": "abc123def456",
  "caregiver_ids": ["cg1", "cg2", "cg3"]
}
```

### Create Your First Baby

```bash
curl -X POST http://localhost:8000/api/babies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emma",
    "birth_date": "2024-01-15"
  }'
```

Response:
```json
{
  "id": "baby_xyz",
  "name": "Emma",
  "birth_date": "2024-01-15",
  "photo_url": null,
  "created_at": "2024-01-15T10:30:00"
}
```

### Create a Caregiver

```bash
curl -X POST http://localhost:8000/api/caregivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria",
    "role": "mãe",
    "avatar_color": "blue"
  }'
```

### Log a Feeding Event

```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "baby_id": "baby_xyz",
    "caregiver_id": "caregiver_xyz",
    "type": "feeding",
    "subtype": "bottle_formula",
    "timestamp": "2024-01-15T10:30:00",
    "quantity": 120,
    "unit": "ml",
    "notes": "Baby seemed hungry"
  }'
```

### View Today's Dashboard

```bash
curl http://localhost:8000/api/dashboard?baby_id=baby_xyz
```

Response includes:
- Baby info
- Today's summary (feeding count, sleep hours, diaper changes)
- Recent events
- Available caregivers

### Get Daily Summary

```bash
curl "http://localhost:8000/api/events/summary/daily?baby_id=baby_xyz&date=2024-01-15"
```

Response:
```json
{
  "date": "2024-01-15",
  "feeding_count": 4,
  "feeding_total_ml": 480,
  "hydration_count": 2,
  "sleep_hours": 14.5,
  "diaper_count": 8,
  "activity_count": 3
}
```

## Available Roles

When creating caregivers, use these roles:
- `pai` (father)
- `mãe` (mother)
- `babá` (babysitter)
- `avó` (grandmother)
- `avô` (grandfather)
- `outro` (other)

## Avatar Colors

- `red`
- `blue`
- `green`
- `yellow`
- `purple`
- `orange`
- `pink`
- `teal`

## Event Types

### Feeding
- `bottle_formula` - Formula from bottle
- `bottle_breastmilk` - Expressed breast milk
- `breastfeeding` - Direct nursing
- `solids` - Solid foods
- `snack` - Snacks

### Sleep
- `nap` - Daytime nap
- `night_sleep` - Nighttime sleep

### Hydration
- `water` - Plain water
- `juice` - Juice
- `other` - Other beverages

### Diaper
- `wet` - Wet diaper
- `dirty` - Soiled diaper
- `mixed` - Both wet and soiled

### Activity
- `tummy_time`
- `reading`
- `play`
- `walk`
- `bath`
- `sensory`

## File Storage

Data is stored in JSON files in the `data/` directory:
- `babies.json` - All baby profiles
- `caregivers.json` - Caregiver info
- `events.json` - Event log entries
- `medications.json` - Medications

These are automatically created when the server starts.

## Troubleshooting

### Port Already in Use
If port 8000 is busy, edit `main.py`:
```python
uvicorn.run(
    "main:app",
    host="0.0.0.0",
    port=8001,  # Change this
    reload=settings.debug,
)
```

### Data Not Persisting
Make sure the `data/` directory exists and is writable:
```bash
mkdir -p data
chmod 755 data
```

### CORS Errors from Frontend
If your frontend is at a different origin, update `cors_allowed_origins` in `config.py`:
```python
self.cors_allowed_origins = [
    "http://localhost:3000",      # Your frontend
    "https://yourdomain.com",
]
```

## Next Steps

1. **Integrate with Frontend**: Connect your React/Vue frontend to these endpoints
2. **Add Database**: Replace JSON storage with SQLite/PostgreSQL
3. **Add Authentication**: Implement user authentication and authorization
4. **Deploy**: Deploy to cloud platform (Heroku, AWS, etc.)

## API Routes Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/babies` | List babies |
| POST | `/api/babies` | Create baby |
| GET | `/api/babies/{id}` | Get baby |
| PUT | `/api/babies/{id}` | Update baby |
| GET | `/api/caregivers` | List caregivers |
| POST | `/api/caregivers` | Create caregiver |
| PUT | `/api/caregivers/{id}` | Update caregiver |
| DELETE | `/api/caregivers/{id}` | Delete caregiver |
| GET | `/api/events` | List events (filter by baby_id) |
| POST | `/api/events` | Create event |
| GET | `/api/events/{id}` | Get event |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event |
| GET | `/api/events/timeline/view` | Timeline view |
| GET | `/api/events/summary/daily` | Daily summary |
| GET | `/api/events/summary/weekly` | Weekly summary |
| GET | `/api/dashboard` | Full dashboard |
| GET | `/api/dashboard/hero` | Hero card |
| POST | `/api/setup` | Initial setup |
| POST | `/api/setup/seed` | Seed demo data |

## Support

For detailed API documentation, visit: http://localhost:8000/docs
