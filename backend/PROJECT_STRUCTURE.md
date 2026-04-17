# BabyHealth Backend - Project Structure & Architecture

## Complete File Structure

```
backend/
├── .env.example                      # Environment variables template
├── README.md                         # Full documentation
├── QUICKSTART.md                     # 5-minute getting started guide
├── PROJECT_STRUCTURE.md              # This file
├── requirements.txt                  # Python dependencies
├── config.py                         # Configuration management
├── main.py                           # FastAPI app entry point
│
├── models/                           # Data Models (Pydantic v2)
│   ├── __init__.py
│   ├── baby.py                       # Baby profile & schemas
│   ├── caregiver.py                  # Caregiver & schemas
│   ├── event.py                      # Event/activity log & schemas
│   └── medication.py                 # Medication tracking & schemas
│
├── repositories/                     # Data Access Layer (Repository Pattern)
│   ├── __init__.py
│   ├── base.py                       # Abstract repository interface
│   ├── json_repository.py            # JSON file-based implementation
│   └── sqlite_repository.py          # SQLite implementation (stub)
│
├── services/                         # Business Logic Layer
│   ├── __init__.py
│   ├── event_service.py              # Event operations & summaries
│   ├── dashboard_service.py          # Dashboard data aggregation
│   └── report_service.py             # Analytics & reporting
│
├── routers/                          # API Endpoints (FastAPI Routers)
│   ├── __init__.py
│   ├── babies.py                     # Baby CRUD endpoints
│   ├── caregivers.py                 # Caregiver management endpoints
│   ├── events.py                     # Event logging & query endpoints
│   ├── dashboard.py                  # Dashboard endpoints
│   └── setup.py                      # Initial setup & demo data
│
├── data/                             # JSON storage (runtime; root from DATA_DIR)
│   ├── .gitkeep
│   └── …                             # e.g. default/, davi_test/, or flat *.json at runtime
│
├── ui_app_defaults/                  # Read-only UI bootstrap JSON (versioned in git)
│   └── *.json                        # catalogs, growth, default_baby, etc.
│
└── tests/                            # Test Suite
    ├── __init__.py
    ├── test_events.py                # Event service tests
    └── test_dashboard.py             # Dashboard service tests
```

## Architecture Layers

### 1. Presentation Layer (Routers)
**Location**: `routers/`

Handles HTTP requests and responses. Each router corresponds to a resource:
- Takes request parameters and body
- Validates input via Pydantic schemas
- Calls services with validated data
- Returns appropriate HTTP status codes

**Key Pattern**: Dependency injection for services
```python
@router.get("/api/events")
async def list_events(service: EventService = Depends(get_event_service)):
    return service.get_events_for_baby(...)
```

### 2. Business Logic Layer (Services)
**Location**: `services/`

Contains business rules and data orchestration:
- EventService: Event CRUD, filtering, summaries
- DashboardService: Aggregating data for UI
- ReportService: Analytics and insights

**Key Pattern**: Services receive repository as dependency
```python
class EventService:
    def __init__(self, repository: BaseRepository):
        self.repo = repository
```

### 3. Data Access Layer (Repositories)
**Location**: `repositories/`

Abstract data access with pluggable implementations:
- BaseRepository: Abstract interface defining all operations
- JsonRepository: Concrete implementation using JSON files
- SqliteRepository: Stub for future database implementation

**Key Pattern**: All operations go through repository, not direct file/DB access
```python
# Services never directly access files
# They use: self.repo.get_by_id("event", event_id)
```

### 4. Data Model Layer (Models)
**Location**: `models/`

Pydantic models for type safety and validation:
- **Entity Models**: Baby, Caregiver, Event, Medication
- **Create Schemas**: For POST requests
- **Update Schemas**: For PUT requests
- **Response Schemas**: For API responses

**Key Pattern**: Separate models for create/update
```python
class BabyCreate(BaseModel):
    name: str
    birth_date: str

class Baby(BaseModel):
    id: str
    name: str
    ...
```

## Data Flow

### Create Event Example

```
HTTP Request (POST /api/events)
    ↓
[Router] events.py
    - Validates JSON with EventCreate schema
    - Calls: service.create_event(event_data)
    ↓
[Service] EventService
    - Business logic (if any)
    - Calls: self.repo.create("event", event_dict)
    ↓
[Repository] JsonRepository
    - Loads events.json
    - Appends new event
    - Saves events.json
    ↓
[Response] HTTP 200 + EventResponse JSON
```

## Repository Pattern Benefits

### Current Implementation (JSON)
- No database setup required
- Perfect for MVP and testing
- Data visible and editable (events.json is plain text)

### Easy Migration
Want to switch to SQLite or PostgreSQL? Just:
1. Implement SqliteRepository with same interface as BaseRepository
2. Update config to use new implementation
3. All services and routers work unchanged!

**Example**: Implementing SQLite
```python
# In repositories/sqlite_repository.py
class SqliteRepository(BaseRepository):
    def get_by_id(self, model_type, id):
        # SQL query here

    def create(self, model_type, data):
        # INSERT statement here
```

Then in config:
```python
if settings.storage_type == "sqlite":
    return SqliteRepository(db_path)
else:
    return JsonRepository(data_dir)
```

## API Endpoint Organization

### By Resource Type

**Babies** (`routers/babies.py`)
- GET /api/babies - List all
- POST /api/babies - Create
- GET /api/babies/{id} - Retrieve
- PUT /api/babies/{id} - Update

**Caregivers** (`routers/caregivers.py`)
- GET /api/caregivers - List all
- POST /api/caregivers - Create
- PUT /api/caregivers/{id} - Update
- DELETE /api/caregivers/{id} - Delete

**Events** (`routers/events.py`)
- GET /api/events - List with filters
- POST /api/events - Create
- GET /api/events/{id} - Retrieve
- PUT /api/events/{id} - Update
- DELETE /api/events/{id} - Delete
- GET /api/events/timeline/view - Timeline
- GET /api/events/summary/daily - Daily stats
- GET /api/events/summary/weekly - Weekly stats

**Dashboard** (`routers/dashboard.py`)
- GET /api/dashboard - Full dashboard
- GET /api/dashboard/hero - Quick stats

**Setup** (`routers/setup.py`)
- POST /api/setup - Initial setup
- POST /api/setup/seed - Demo data

## Service Responsibilities

### EventService (`services/event_service.py`)
- Create/read/update/delete events
- Filter events by baby, date, type, caregiver
- Calculate daily summaries
- Calculate weekly summaries
- Parse datetime strings

### DashboardService (`services/dashboard_service.py`)
- Aggregate hero card data (baby info, age, last 3 activities)
- Fetch today's summary
- Get recent events
- Enrich events with caregiver info

### ReportService (`services/report_service.py`)
- Feeding report (sessions, volume, by type)
- Sleep report (hours, nap vs night, awakenings)
- Diaper report (wet/dirty/mixed counts)
- Activity report (activity types and duration)
- Comprehensive report across all metrics

## Event Type Hierarchy

```
Events (6 types)
├── Feeding
│   ├── bottle_formula
│   ├── bottle_breastmilk
│   ├── breastfeeding (+ metadata: side, duration, mode)
│   ├── solids (+ metadata: food_name, first_exposure)
│   └── snack
├── Hydration
│   ├── water
│   ├── juice
│   └── other
├── Sleep
│   ├── nap
│   └── night_sleep (+ metadata: awakenings)
├── Diaper
│   ├── wet
│   ├── dirty
│   └── mixed
├── Activity
│   ├── tummy_time
│   ├── reading
│   ├── play
│   ├── walk
│   ├── bath
│   └── sensory
└── Medication (separate from events)
```

## Testing Strategy

### Unit Tests
- Repository tests (test JSON operations)
- Service tests (test business logic)
- Located in `tests/` directory

### How to Run
```bash
pip install pytest
pytest tests/
```

### Test Files
- `test_events.py`: Event service functionality
- `test_dashboard.py`: Dashboard aggregation

## Configuration Management

### Environment Variables (`config.py`)
```python
class Settings:
    # App
    app_name = "BabyHealth API"
    app_version = "1.0.0"
    debug = True

    # Storage
    storage_type = "json"
    data_dir = Path(__file__).parent / "data"

    # CORS
    cors_allowed_origins = [
        "http://localhost:3000",
        "http://localhost:8080",
        "*"
    ]
```

### Setting Overrides
Create `.env` file:
```
DEBUG=False
STORAGE_TYPE=sqlite
DATA_DIR=/path/to/data
```

## Error Handling

### Repository Errors
- Returns None for not found
- Returns False for failed delete
- Throws no exceptions

### Service Errors
- Wraps repository errors
- Provides higher-level semantics
- Still no exceptions

### Router Errors
- Converts errors to HTTP responses
- Raises HTTPException for 404, 400, etc.
- Automatic response serialization

## CORS Configuration

### Default (Development)
All origins allowed:
```python
cors_allowed_origins = ["*"]
```

### Production
Specific origins only:
```python
cors_allowed_origins = [
    "https://babyhealth.com",
    "https://app.babyhealth.com"
]
```

## Key Design Patterns

### 1. Dependency Injection
Services and repositories injected via FastAPI's `Depends()`
```python
@router.get("/api/events")
async def list_events(service: EventService = Depends(get_event_service)):
    pass
```

### 2. Repository Pattern
Abstract interface with swappable implementations
```python
class BaseRepository(ABC):
    @abstractmethod
    def get_by_id(self, model_type, id): pass
```

### 3. Layered Architecture
Clear separation of concerns:
- Routers (HTTP)
- Services (Business Logic)
- Repositories (Data Access)
- Models (Data)

### 4. Factory Functions
Create repositories/services in dependency injection
```python
def get_repository() -> BaseRepository:
    if settings.storage_type == "json":
        return JsonRepository(settings.data_dir)
```

## Performance Considerations

### Current (JSON)
- ✓ Fast for <1000 records
- ✓ Simple, no setup
- ✗ Full file load for each operation
- ✗ No indexing

### Optimizations
1. Add caching for frequently accessed data
2. Implement pagination for event lists
3. Add database indexes for filtered queries
4. Consider in-memory cache for baby/caregiver lists

### Database Migration Path
1. Add SQLite repository
2. Add migration script (JSON → SQLite)
3. Switch config to use SQLite
4. Remove JsonRepository when confident

## Adding New Features

### Adding a New Event Type
1. Add subtype to `models/event.py`
2. Create handler in `services/event_service.py` if special logic
3. Document in README

### Adding a New Endpoint
1. Create route function in appropriate router
2. Use Pydantic schemas for validation
3. Inject services via Depends()
4. Return appropriate HTTP status

### Adding a New Service
1. Create class in `services/`
2. Receive repository via constructor
3. Implement business logic methods
4. Use in routers via dependency injection

## Documentation

- **API Docs**: http://localhost:8080/docs (auto-generated)
- **README.md**: Comprehensive API and architecture docs
- **QUICKSTART.md**: 5-minute getting started
- **PROJECT_STRUCTURE.md**: This file (architecture overview)

## Running the Application

### Development
```bash
pip install -r requirements.txt
python main.py
# API available at http://localhost:8080
# Docs at http://localhost:8080/docs
```

### Testing
```bash
pip install pytest
pytest tests/
```

### Production Considerations
1. Set DEBUG=False
2. Use external database (SQLite/PostgreSQL)
3. Configure CORS to specific domains
4. Deploy behind reverse proxy (nginx)
5. Use environment variables for secrets
6. Set up logging
7. Monitor error rates

## Summary

BabyHealth Backend follows clean architecture principles:
- **Clear separation of concerns** via layers
- **Dependency injection** for testability and flexibility
- **Repository pattern** for easy backend swapping
- **Pydantic validation** for type safety
- **FastAPI** for automatic OpenAPI documentation
- **Minimal dependencies** for easy deployment

The architecture supports MVP launch with JSON storage, with a clear path to scale to a production database.
