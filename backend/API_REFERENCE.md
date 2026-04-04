# BabyHealth API - Quick Reference Card

## Base URL
```
http://localhost:8000/api
```

## Authentication
Currently MVP - no authentication required. Simple caregiver selection.

## Health Check
```
GET /
GET /health
```

## BABIES

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/babies` | List all babies |
| POST | `/babies` | Create baby |
| GET | `/babies/{id}` | Get baby details |
| PUT | `/babies/{id}` | Update baby |

### Create Baby
```bash
POST /api/babies
{
  "name": "Emma",
  "birth_date": "2024-01-15",
  "photo_url": null
}
```

### Response
```json
{
  "id": "uuid",
  "name": "Emma",
  "birth_date": "2024-01-15",
  "photo_url": null,
  "created_at": "2024-01-15T10:30:00"
}
```

## CAREGIVERS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/caregivers` | List all caregivers |
| POST | `/caregivers` | Create caregiver |
| PUT | `/caregivers/{id}` | Update caregiver |
| DELETE | `/caregivers/{id}` | Delete caregiver |

### Create Caregiver
```bash
POST /api/caregivers
{
  "name": "Maria",
  "role": "mãe",
  "avatar_color": "blue"
}
```

### Roles
- `pai` - Father
- `mãe` - Mother
- `babá` - Babysitter
- `avó` - Grandmother
- `avô` - Grandfather
- `outro` - Other

### Colors
`red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `teal`

## EVENTS

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events with filters |
| POST | `/events` | Create event |
| GET | `/events/{id}` | Get event details |
| PUT | `/events/{id}` | Update event |
| DELETE | `/events/{id}` | Delete event |
| GET | `/events/timeline/view` | Timeline view |
| GET | `/events/summary/daily` | Daily summary |
| GET | `/events/summary/weekly` | Weekly summary |

### Query Parameters
- `baby_id` (required) - Baby ID
- `date` (optional) - YYYY-MM-DD format
- `event_type` (optional) - feeding, sleep, diaper, activity, hydration, medication
- `caregiver_id` (optional) - Caregiver ID

### Create Feeding Event
```bash
POST /api/events
{
  "baby_id": "baby123",
  "caregiver_id": "cg123",
  "type": "feeding",
  "subtype": "bottle_formula",
  "timestamp": "2024-01-15T10:30:00",
  "quantity": 120,
  "unit": "ml",
  "notes": "Baby seemed hungry",
  "metadata": {}
}
```

### Event Types & Subtypes

**Feeding**
- `bottle_formula`
- `bottle_breastmilk`
- `breastfeeding`
- `solids`
- `snack`

**Sleep**
- `nap`
- `night_sleep`

**Hydration**
- `water`
- `juice`
- `other`

**Diaper**
- `wet`
- `dirty`
- `mixed`

**Activity**
- `tummy_time`
- `reading`
- `play`
- `walk`
- `bath`
- `sensory`

### Get Daily Summary
```bash
GET /api/events/summary/daily?baby_id=baby123&date=2024-01-15
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

### Get Weekly Summary
```bash
GET /api/events/summary/weekly?baby_id=baby123&start_date=2024-01-08
```

Response includes daily_summaries array plus aggregated totals.

## DASHBOARD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Full dashboard data |
| GET | `/dashboard/hero` | Quick stats card |

### Get Full Dashboard
```bash
GET /api/dashboard?baby_id=baby123
```

Response includes:
- Baby info
- Today's summary
- Recent events (enriched with caregiver info)
- Available caregivers

### Get Hero Card
```bash
GET /api/dashboard/hero?baby_id=baby123
```

Response includes:
- Baby age (months and days)
- Last feeding
- Last sleep
- Last diaper change
- Today's summary

## SETUP

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/setup` | Initial setup |
| POST | `/setup/seed` | Seed demo data |

### Initial Setup
```bash
POST /api/setup
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
    }
  ]
}
```

### Seed Demo Data
```bash
POST /api/setup/seed
```

Creates demo baby, caregivers, and sample events.

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 500 | Server Error |

## Error Response
```json
{
  "detail": "Error description"
}
```

## DateTime Format

All timestamps use ISO 8601 format:
```
2024-01-15T10:30:00
```

Dates are YYYY-MM-DD:
```
2024-01-15
```

## Useful curl Examples

### Create Baby
```bash
curl -X POST http://localhost:8000/api/babies \
  -H "Content-Type: application/json" \
  -d '{"name":"Emma","birth_date":"2024-01-15"}'
```

### Create Caregiver
```bash
curl -X POST http://localhost:8000/api/caregivers \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","role":"mãe","avatar_color":"blue"}'
```

### Log Feeding Event
```bash
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "baby_id":"baby123",
    "caregiver_id":"cg123",
    "type":"feeding",
    "subtype":"bottle_formula",
    "timestamp":"2024-01-15T10:30:00",
    "quantity":120,
    "unit":"ml"
  }'
```

### Get Daily Summary
```bash
curl "http://localhost:8000/api/events/summary/daily?baby_id=baby123&date=2024-01-15"
```

### Get Dashboard
```bash
curl "http://localhost:8000/api/dashboard?baby_id=baby123"
```

### List Events for Day
```bash
curl "http://localhost:8000/api/events?baby_id=baby123&date=2024-01-15"
```

### Filter by Event Type
```bash
curl "http://localhost:8000/api/events?baby_id=baby123&event_type=feeding"
```

### Seed Demo Data
```bash
curl -X POST http://localhost:8000/api/setup/seed
```

## Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Common Workflows

### 1. Get Started
```bash
# Seed demo data
curl -X POST http://localhost:8000/api/setup/seed

# List babies
curl http://localhost:8000/api/babies

# Use baby_id from response for next calls
```

### 2. Create from Scratch
```bash
# Create baby
BABY=$(curl -X POST http://localhost:8000/api/babies \
  -H "Content-Type: application/json" \
  -d '{"name":"Emma","birth_date":"2024-01-15"}' | jq -r '.id')

# Create caregiver
CAREGIVER=$(curl -X POST http://localhost:8000/api/caregivers \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","role":"mãe","avatar_color":"blue"}' | jq -r '.id')

# Log feeding event
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d "{\"baby_id\":\"$BABY\",\"caregiver_id\":\"$CAREGIVER\",\"type\":\"feeding\",\"subtype\":\"bottle_formula\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S)\",\"quantity\":120,\"unit\":\"ml\"}"

# View dashboard
curl "http://localhost:8000/api/dashboard?baby_id=$BABY"
```

### 3. Daily Log
```bash
# Log feeding
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{"baby_id":"baby123","caregiver_id":"cg123","type":"feeding","subtype":"bottle_formula","timestamp":"2024-01-15T10:30:00","quantity":120,"unit":"ml"}'

# Log diaper change
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{"baby_id":"baby123","caregiver_id":"cg123","type":"diaper","subtype":"wet","timestamp":"2024-01-15T11:00:00"}'

# Log sleep
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{"baby_id":"baby123","caregiver_id":"cg123","type":"sleep","subtype":"nap","timestamp":"2024-01-15T12:00:00","end_timestamp":"2024-01-15T13:30:00","metadata":{"awakenings":1}}'
```

### 4. View Reports
```bash
# Daily summary
curl "http://localhost:8000/api/events/summary/daily?baby_id=baby123&date=2024-01-15"

# Weekly summary
curl "http://localhost:8000/api/events/summary/weekly?baby_id=baby123&start_date=2024-01-08"

# Timeline for day
curl "http://localhost:8000/api/events/timeline/view?baby_id=baby123&date=2024-01-15"

# Dashboard with all info
curl "http://localhost:8000/api/dashboard?baby_id=baby123"
```

## Tips

1. **Get IDs**: Use jq to extract IDs from responses:
   ```bash
   curl ... | jq -r '.id'
   ```

2. **Pretty Print**: Use jq to format responses:
   ```bash
   curl ... | jq '.'
   ```

3. **Set Variables**: Store IDs for repeated use:
   ```bash
   BABY_ID="abc123def456"
   CAREGIVER_ID="xyz789"
   ```

4. **Current DateTime**: Use ISO format:
   ```bash
   date -u +%Y-%m-%dT%H:%M:%S
   ```

5. **Check Status**: Add `-v` to curl:
   ```bash
   curl -v http://localhost:8000/api/babies
   ```

## Limits & Constraints

- No authentication required (MVP)
- No rate limiting
- No pagination (returns all results)
- Event types are predefined
- Roles are predefined
- Colors are predefined

## File Storage

Data stored in `data/` directory:
- `babies.json` - All babies
- `caregivers.json` - All caregivers
- `events.json` - All events
- `medications.json` - All medications

Can be edited directly, but API is recommended.

## Support

- **API Docs**: http://localhost:8000/docs
- **Full README**: See README.md in backend directory
- **Quick Start**: See QUICKSTART.md
- **Architecture**: See PROJECT_STRUCTURE.md
