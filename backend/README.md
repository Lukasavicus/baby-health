# BabyHealth API Backend

A FastAPI-based RESTful API backend for BabyHealth, a Samsung Health-inspired baby tracking application.

## Overview

BabyHealth API provides comprehensive endpoints for tracking baby activities including:
- Feeding (bottle, breastfeeding, solids, snacks)
- Sleep patterns (naps, night sleep)
- Diaper changes
- Daily activities and play
- Medications
- Multi-caregiver support

## Architecture

### Technology Stack
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn
- **Data Validation**: Pydantic v2
- **Storage**: JSON (pluggable for SQLite/PostgreSQL)

### Core Components

#### 1. Models (`models/`)
Data models with Pydantic validation:
- **Baby**: Baby profile with birth date and optional photo
- **Caregiver**: Caregiver info with roles (parent, babysitter, grandparent)
- **Event**: Generic log entries for activities
- **Medication**: Medication tracking

#### 2. Repository Pattern (`repositories/`)
Abstract data access layer with pluggable implementations:
- **BaseRepository**: Abstract interface
- **JsonRepository**: JSON file-based storage (default)
- **SqliteRepository**: Stub for future SQLite implementation

Supports easy switching between storage backends without changing service logic.

#### 3. Services (`services/`)
Business logic layer:
- **EventService**: Event CRUD, filtering, and daily/weekly summaries
- **DashboardService**: Aggregated dashboard data
- **ReportService**: Analytics and insights across metrics

#### 4. Routers (`routers/`)
RESTful API endpoints:
- **babies.py**: Baby CRUD operations
- **caregivers.py**: Caregiver management
- **events.py**: Event logging and querying
- **dashboard.py**: Dashboard data endpoints
- **setup.py**: Initial setup and demo data seeding

## Installation

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
# Edit .env with your settings if needed
```

### 3. Run the Server
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Base URL
```
http://localhost:8000/api
```

## Endpoints

### Babies

#### List Babies
```
GET /api/babies
```

#### Create Baby
```
POST /api/babies
Content-Type: application/json

{
  "name": "Emma",
  "birth_date": "2024-01-15",
  "photo_url": null
}
```

#### Get Baby
```
GET /api/babies/{baby_id}
```

#### Update Baby
```
PUT /api/babies/{baby_id}
Content-Type: application/json

{
  "name": "Emma",
  "birth_date": "2024-01-15"
}
```

### Caregivers

#### List Caregivers
```
GET /api/caregivers
```

#### Create Caregiver
```
POST /api/caregivers
Content-Type: application/json

{
  "name": "Maria",
  "role": "mãe",
  "avatar_color": "blue"
}
```

Supported roles: `pai`, `mãe`, `babá`, `avó`, `avô`, `outro`

#### Update Caregiver
```
PUT /api/caregivers/{caregiver_id}
```

#### Delete Caregiver
```
DELETE /api/caregivers/{caregiver_id}
```

### Events

#### List Events (with filters)
```
GET /api/events?baby_id=X&date=2024-01-15&type=feeding&caregiver_id=Y
```

Query parameters:
- `baby_id` (required): Baby ID
- `date` (optional): YYYY-MM-DD format
- `event_type` (optional): feeding, hydration, sleep, diaper, activity
- `caregiver_id` (optional): Filter by caregiver

#### Create Event
```
POST /api/events
Content-Type: application/json

{
  "baby_id": "baby123",
  "caregiver_id": "caregiver123",
  "type": "feeding",
  "subtype": "bottle_formula",
  "timestamp": "2024-01-15T10:30:00",
  "quantity": 120,
  "unit": "ml",
  "notes": "Baby seemed hungry",
  "metadata": {}
}
```

#### Get Event
```
GET /api/events/{event_id}
```

#### Update Event
```
PUT /api/events/{event_id}
```

#### Delete Event
```
DELETE /api/events/{event_id}
```

#### Timeline View
```
GET /api/events/timeline/view?baby_id=X&date=2024-01-15
```

#### Daily Summary
```
GET /api/events/summary/daily?baby_id=X&date=2024-01-15
```

Response includes:
- feeding_count, feeding_total_ml
- hydration_count
- sleep_hours
- diaper_count
- activity_count

#### Weekly Summary
```
GET /api/events/summary/weekly?baby_id=X&start_date=2024-01-08
```

### Dashboard

#### Full Dashboard
```
GET /api/dashboard?baby_id=X
```

Returns hero card data + today's summary + recent events + caregivers

#### Hero Card
```
GET /api/dashboard/hero?baby_id=X
```

Quick stats for today:
- Baby info and age
- Last feeding/sleep/diaper times
- Daily summary

### Setup

#### Initial Setup
```
POST /api/setup
Content-Type: application/json

{
  "baby": {
    "name": "Emma",
    "birth_date": "2024-01-15",
    "photo_url": null
  },
  "caregivers": [
    {
      "name": "Maria",
      "role": "mãe",
      "avatar_color": "blue"
    },
    {
      "name": "João",
      "role": "pai",
      "avatar_color": "green"
    }
  ]
}
```

#### Seed Demo Data
```
POST /api/setup/seed
```

Creates demo baby, caregivers, and sample events for testing.

## Event Types and Subtypes

### Feeding
- `bottle_formula`: Formula from bottle
- `bottle_breastmilk`: Expressed breast milk from bottle
- `breastfeeding`: Direct breastfeeding
- `solids`: Solid foods
- `snack`: Snacks

Metadata for breastfeeding:
```json
{
  "mode": "basic|advanced",
  "side": "left|right|both",
  "duration_minutes": 15,
  "pumping": false
}
```

Metadata for solids:
```json
{
  "food_name": "apple puree",
  "first_exposure": true,
  "favorite": false,
  "reaction": null|"mild"|"severe",
  "acceptance": "good|little|refused"
}
```

### Sleep
- `nap`: Daytime nap
- `night_sleep`: Nighttime sleep

Metadata:
```json
{
  "awakenings": 2
}
```

### Hydration
- `water`: Water
- `juice`: Juice
- `other`: Other drinks

### Diaper
- `wet`: Wet diaper
- `dirty`: Soiled diaper
- `mixed`: Both wet and soiled

### Activity
- `tummy_time`: Tummy time
- `reading`: Reading/stories
- `play`: Play time
- `walk`: Walks outside
- `bath`: Bath time
- `sensory`: Sensory activities

## Testing

Run tests with pytest:
```bash
pip install pytest
pytest tests/
```

### Test Files
- `test_events.py`: Event service and repository tests
- `test_dashboard.py`: Dashboard service tests

## Data Storage

### JSON Storage
By default, data is stored in the `data/` directory as JSON files:
- `data/babies.json`: Baby profiles
- `data/caregivers.json`: Caregiver information
- `data/events.json`: Event log entries
- `data/medications.json`: Medication records

### Switching Storage Backends
Update `config.py` or set `STORAGE_TYPE` environment variable:
- `"json"`: JSON file storage (default)
- `"sqlite"`: SQLite database (stub - needs implementation)

## Configuration

Edit `.env` or environment variables:

```
APP_NAME=BabyHealth API
APP_VERSION=1.0.0
DEBUG=True
STORAGE_TYPE=json
DATA_DIR=./data
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,*
```

## CORS Configuration

By default, CORS is enabled for local development. Update `cors_allowed_origins` in configuration to restrict to specific domains:

```python
# In config.py
cors_allowed_origins = [
    "http://localhost:3000",
    "https://babyhealth.com"
]
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- **200**: Success
- **201**: Created
- **400**: Bad request
- **404**: Not found
- **500**: Server error

Error response format:
```json
{
  "detail": "Error description"
}
```

## Project Structure

```
backend/
├── requirements.txt           # Python dependencies
├── main.py                    # FastAPI app entry point
├── config.py                  # Configuration
├── models/                    # Data models
│   ├── __init__.py
│   ├── baby.py
│   ├── caregiver.py
│   ├── event.py
│   └── medication.py
├── repositories/              # Data access layer
│   ├── __init__.py
│   ├── base.py               # Abstract base
│   ├── json_repository.py    # JSON implementation
│   └── sqlite_repository.py  # SQLite stub
├── services/                 # Business logic
│   ├── __init__.py
│   ├── event_service.py
│   ├── dashboard_service.py
│   └── report_service.py
├── routers/                  # API endpoints
│   ├── __init__.py
│   ├── babies.py
│   ├── caregivers.py
│   ├── events.py
│   ├── dashboard.py
│   └── setup.py
├── data/                     # JSON storage directory
└── tests/                    # Test suite
    ├── __init__.py
    ├── test_events.py
    └── test_dashboard.py
```

## Development Notes

### Adding New Event Types
1. Add subtype literal to `models/event.py`
2. Add handling in `services/event_service.py` if special logic needed
3. Document metadata structure in this README

### Implementing SQLite
1. Create `repositories/sqlite_repository.py` with full implementation
2. Update `repositories/__init__.py` to export it
3. Update config to allow `storage_type = "sqlite"`
4. All services automatically work with the new backend

### Adding New Endpoints
1. Create endpoint function in appropriate router
2. Use dependency injection for repository/services
3. Pydantic schemas provide automatic validation and OpenAPI docs
4. Endpoint automatically appears in `/docs` Swagger UI

## Performance Considerations

### Current JSON Storage
- Suitable for MVP and small-scale deployments
- All data loaded into memory for filtering
- Simple deployment without database setup

### For Production
- Implement SQLite or PostgreSQL backend
- Add database indexing for frequently filtered fields
- Consider caching for dashboard queries
- Implement pagination for large event lists

## Contributing

Follow these patterns:
- Use Pydantic models for validation
- Implement business logic in services, not routers
- Use abstract repository pattern for data access
- Add tests for new features
- Keep routers thin - logic goes in services

## License

Project is part of BabyHealth application
