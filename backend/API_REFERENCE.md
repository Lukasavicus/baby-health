# BabyHealth API - Quick Reference Card

## Base URL
```
http://localhost:8080/api
```

## Authentication
Currently MVP - no authentication required. Simple caregiver selection.

## Health Check
```
GET /
GET /health
```

## JSON storage (`DATA_DIR`)

All repository-backed endpoints read and write under **`DATA_DIR`** (env var, default `backend/data` relative to config). That folder must contain `babies.json`, `caregivers.json`, `events.json`, etc. Uploaded images for that profile go under **`DATA_DIR/images/`** (created automatically; max **10 MiB** per file, **1 GiB** total for all files in that folder).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/media/upload` | Multipart field `file`. Allowed: JPEG, PNG, GIF, WebP, BMP, TIFF, HEIC/HEIF (by extension or `Content-Type`). Returns `{ "url": "/api/media/<id>.<ext>", ... }` to store in `baby.photo_url`. |
| GET | `/api/media/{filename}` | Public read of a file previously uploaded to the active profile’s `images/` folder. |

To use a different dataset (e.g. `backend/data/davi_test`), **point `DATA_DIR` at that directory** when starting the API (absolute path recommended, or relative to the process working directory). There is no query parameter or header for switching folders at request time.

## UI SEED (app-design)

**Environment:** `BABYHEALTH_USE_UI_SEED=1` enables reading `backend/ui_app_defaults/*.json`. Optional: `BABYHEALTH_UI_DEFAULTS_DIR` overrides that directory (absolute or relative path expanded from env). If `BABYHEALTH_USE_UI_SEED` is unset (default), `/api/ui/bootstrap` returns the same JSON **shape** with **empty** catalogs and lists, and `baby` comes only from `babies.json` (placeholder baby with empty `id`/`name` when there are no records). `/api/ui/seed/*` returns **404** when seed is disabled.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ui/bootstrap` | With seed: merged demo + repo baby (or `default_baby.json`). Without seed: empty UI data + repo baby only. Optional query: `baby_id`. |
| GET | `/api/ui/seed/{name}` | Single seed file by logical name (e.g. `catalogs`, `growth`, `milestones`). See `seed_json_store.SEED_NAMES`. Only when `BABYHEALTH_USE_UI_SEED=1`. |

Example:

```bash
# Empty bootstrap (default)
curl -s http://localhost:8080/api/ui/bootstrap | head

# Demo catalogs from JSON files
BABYHEALTH_USE_UI_SEED=1 curl -s http://localhost:8080/api/ui/bootstrap | head
curl -s http://localhost:8080/api/ui/seed/catalogs | head
```

From the repo root, `npm run dev-api` starts the API without seed; `npm run dev-api-seed` sets `BABYHEALTH_USE_UI_SEED=1`.

## App-design persistence (JSON store)

**Events (trackers + timeline):** With a real `baby.id` from bootstrap and a selected caregiver, the UI persists logs via `GET/POST/PUT/DELETE /api/events` (`baby_id` required; optional `date=YYYY-MM-DD`, `event_type=`). Detail screens and “Hoje” prefer these API results when `canPersist` is true; seed `tracker_logs` / `timeline_seed` remain fallbacks if the API fails or IDs are missing.

**Bootstrap `today`:** Optional `hydrationGoalMl` (default `500` in app when absent) sets the hydration progress target on the Today screen. `initialWaterMl` is legacy/demo; the app-design Today view derives demo hydration total from `tracker_logs.hydration.initialLogs` when not using the API.

**Per-baby UI state (growth, milestones, vitamins, vaccines, health events):** Stored in `baby_ui_state.json` under the same `DATA_DIR` as the other JSON files. Keys are optional: `growth_entries`, `milestones`, `vitamins`, `vaccines`, `health_events` (each a JSON array when set).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ui/baby-state/{baby_id}` | Returns saved state for that baby (may be `{}`). |
| PUT | `/api/ui/baby-state/{baby_id}` | Merges provided keys into stored state (replace per key). |

```bash
# With API using default DATA_DIR=backend/data
curl -s "http://localhost:8080/api/ui/baby-state/BABY_ID"
curl -s -X PUT "http://localhost:8080/api/ui/baby-state/BABY_ID" \
  -H "Content-Type: application/json" \
  -d '{"growth_entries":[]}'
```

**Manual check:** Start the API with `DATA_DIR` pointing at your dataset folder (e.g. `backend/data/davi_test`), register a sleep or feeding in the app, reload, and confirm `events.json` (and optionally `baby_ui_state.json`) updated in that folder.

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
- `event_type` (optional) - feeding, sleep, diaper, activity, hydration, medication, bath, health
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

Canonical `type` values: `feeding`, `hydration`, `sleep`, `diaper`, `activity`, `medication`, **`bath`**, **`health`**.

**POST / PUT normalization (App Design aliases)**  
Incoming bodies are normalized before storage. Examples:

| Area | Accepted alias / input | Stored |
|------|------------------------|--------|
| Diaper subtype | `pee` | `wet` |
| Diaper subtype | `poo` | `dirty` |
| Sleep subtype | `night` | `night_sleep` |
| Sleep window | `metadata.sleep_start` + `metadata.sleep_end` (HH:MM) | `timestamp` / `end_timestamp` (cross-midnight supported) |
| Feeding subtype | `breast` | `breastfeeding` (+ `metadata.breast_side` if sent) |
| Feeding subtype | `bottle` | `bottle_formula` or `bottle_breastmilk` (via `metadata.milk_source` / `bottle_contents`) |
| Feeding subtype | `formula` | `bottle_formula` |
| Hydration subtype | `tea` | `other` + `metadata.drink_type: "tea"` |
| Activity subtype | `tummy` | `tummy_time` |
| Activity subtype | `other` | `play` + `metadata.activity_kind: "other"` |
| Bath | `type: bath`, subtype `frio` / `morno` / `quente` | `subtype: bath` + `metadata.bath_temperature` |
| Health | `type: health`, `subtype: vitamin` \| `medication` | unchanged; use `metadata.health_name`, `metadata.health_dosage` |

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
- `bath` (legacy; prefer top-level `type: bath` for new logs)
- `sensory`
- `music`, `visual`, `auditory`, `spatial`

**Bath** (`type: bath`)
- Subtype typically `bath`; temperature may live in `metadata.bath_temperature` (`frio`, `morno`, `quente`).
- Duration: `metadata.duration_min` and/or `quantity` + `unit: min`.

**Health** (`type: health`)
- `subtype`: `vitamin` or `medication`
- Optional: `metadata.health_name`, `metadata.health_dosage`

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
  "hydration_total_ml": 180,
  "sleep_hours": 14.5,
  "diaper_count": 8,
  "activity_count": 3,
  "bath_count": 1,
  "health_count": 2
}
```

- `feeding_total_ml` sums `quantity` only when `unit` is `ml` (solids in `g` are excluded).
- `hydration_total_ml` sums hydration `quantity` when `unit` is `ml` (default `ml` if omitted).
- `bath_count` includes `type: bath` **and** legacy `type: activity` + `subtype: bath`.
- `health_count` includes `type: health` and `type: medication`.

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
curl -X POST http://localhost:8080/api/babies \
  -H "Content-Type: application/json" \
  -d '{"name":"Emma","birth_date":"2024-01-15"}'
```

### Create Caregiver
```bash
curl -X POST http://localhost:8080/api/caregivers \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","role":"mãe","avatar_color":"blue"}'
```

### Log Feeding Event
```bash
curl -X POST http://localhost:8080/api/events \
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
curl "http://localhost:8080/api/events/summary/daily?baby_id=baby123&date=2024-01-15"
```

### Get Dashboard
```bash
curl "http://localhost:8080/api/dashboard?baby_id=baby123"
```

### List Events for Day
```bash
curl "http://localhost:8080/api/events?baby_id=baby123&date=2024-01-15"
```

### Filter by Event Type
```bash
curl "http://localhost:8080/api/events?baby_id=baby123&event_type=feeding"
```

### Seed Demo Data
```bash
curl -X POST http://localhost:8080/api/setup/seed
```

## Documentation

- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc
- **OpenAPI JSON**: http://localhost:8080/openapi.json

## Common Workflows

### 1. Get Started
```bash
# Seed demo data
curl -X POST http://localhost:8080/api/setup/seed

# List babies
curl http://localhost:8080/api/babies

# Use baby_id from response for next calls
```

### 2. Create from Scratch
```bash
# Create baby
BABY=$(curl -X POST http://localhost:8080/api/babies \
  -H "Content-Type: application/json" \
  -d '{"name":"Emma","birth_date":"2024-01-15"}' | jq -r '.id')

# Create caregiver
CAREGIVER=$(curl -X POST http://localhost:8080/api/caregivers \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","role":"mãe","avatar_color":"blue"}' | jq -r '.id')

# Log feeding event
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d "{\"baby_id\":\"$BABY\",\"caregiver_id\":\"$CAREGIVER\",\"type\":\"feeding\",\"subtype\":\"bottle_formula\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%S)\",\"quantity\":120,\"unit\":\"ml\"}"

# View dashboard
curl "http://localhost:8080/api/dashboard?baby_id=$BABY"
```

### 3. Daily Log
```bash
# Log feeding
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"baby_id":"baby123","caregiver_id":"cg123","type":"feeding","subtype":"bottle_formula","timestamp":"2024-01-15T10:30:00","quantity":120,"unit":"ml"}'

# Log diaper change
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"baby_id":"baby123","caregiver_id":"cg123","type":"diaper","subtype":"wet","timestamp":"2024-01-15T11:00:00"}'

# Log sleep
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"baby_id":"baby123","caregiver_id":"cg123","type":"sleep","subtype":"nap","timestamp":"2024-01-15T12:00:00","end_timestamp":"2024-01-15T13:30:00","metadata":{"awakenings":1}}'
```

### 4. View Reports
```bash
# Daily summary
curl "http://localhost:8080/api/events/summary/daily?baby_id=baby123&date=2024-01-15"

# Weekly summary
curl "http://localhost:8080/api/events/summary/weekly?baby_id=baby123&start_date=2024-01-08"

# Timeline for day
curl "http://localhost:8080/api/events/timeline/view?baby_id=baby123&date=2024-01-15"

# Dashboard with all info
curl "http://localhost:8080/api/dashboard?baby_id=baby123"
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
   curl -v http://localhost:8080/api/babies
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

- **API Docs**: http://localhost:8080/docs
- **Full README**: See README.md in backend directory
- **Quick Start**: See QUICKSTART.md
- **Architecture**: See PROJECT_STRUCTURE.md
