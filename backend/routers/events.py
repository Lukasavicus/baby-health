"""Events API endpoints"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from models.event import EventCreate, EventUpdate, EventResponse, Event
from services import EventService
from repositories import BaseRepository

router = APIRouter(prefix="/api/events", tags=["events"])


def get_repository() -> BaseRepository:
    """Dependency injection for repository"""
    from config import settings
    from repositories import JsonRepository

    if settings.storage_type == "json":
        return JsonRepository(settings.data_dir)
    else:
        raise ValueError(f"Unsupported storage type: {settings.storage_type}")


def get_event_service(repo: BaseRepository = Depends(get_repository)) -> EventService:
    """Dependency injection for event service"""
    return EventService(repo)


@router.get("", response_model=List[EventResponse])
async def list_events(
    baby_id: str = Query(..., description="Baby ID"),
    date: Optional[str] = Query(None, description="YYYY-MM-DD format"),
    event_type: Optional[str] = Query(None, description="Event type to filter"),
    caregiver_id: Optional[str] = Query(None, description="Caregiver ID to filter"),
    service: EventService = Depends(get_event_service),
):
    """List events with optional filters"""
    events = service.get_events_for_baby(
        baby_id=baby_id,
        date=date,
        event_type=event_type,
        caregiver_id=caregiver_id,
    )
    return events


@router.post("", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    service: EventService = Depends(get_event_service),
):
    """Create a new event"""
    import uuid

    event = Event(
        id=uuid.uuid4().hex,
        baby_id=event_data.baby_id,
        caregiver_id=event_data.caregiver_id,
        type=event_data.type,
        subtype=event_data.subtype,
        timestamp=event_data.timestamp,
        end_timestamp=event_data.end_timestamp,
        quantity=event_data.quantity,
        unit=event_data.unit,
        notes=event_data.notes,
        metadata=event_data.metadata,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    created = service.create_event(event.model_dump())
    return created


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(
    event_id: str,
    service: EventService = Depends(get_event_service),
):
    """Get a single event"""
    event = service.get_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    service: EventService = Depends(get_event_service),
):
    """Update an event"""
    existing = service.get_event(event_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    updates = event_data.model_dump(exclude_unset=True)
    updated = service.update_event(event_id, updates)

    if not updated:
        raise HTTPException(status_code=400, detail="Failed to update event")

    return updated


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    service: EventService = Depends(get_event_service),
):
    """Delete an event"""
    existing = service.get_event(event_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Event not found")

    success = service.delete_event(event_id)

    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete event")

    return {"message": "Event deleted successfully"}


@router.get("/timeline/view")
async def get_timeline(
    baby_id: str = Query(..., description="Baby ID"),
    date: Optional[str] = Query(None, description="YYYY-MM-DD format"),
    service: EventService = Depends(get_event_service),
):
    """Get timeline view of events for a day"""
    if not date:
        date = datetime.utcnow().strftime("%Y-%m-%d")

    events = service.get_events_for_baby(baby_id=baby_id, date=date)

    return {
        "date": date,
        "baby_id": baby_id,
        "events": events,
        "event_count": len(events),
    }


@router.get("/summary/daily")
async def get_daily_summary(
    baby_id: str = Query(..., description="Baby ID"),
    date: Optional[str] = Query(None, description="YYYY-MM-DD format"),
    service: EventService = Depends(get_event_service),
):
    """Get daily summary of events"""
    if not date:
        date = datetime.utcnow().strftime("%Y-%m-%d")

    summary = service.get_daily_summary(baby_id, date)
    return summary


@router.get("/summary/weekly")
async def get_weekly_summary(
    baby_id: str = Query(..., description="Baby ID"),
    start_date: str = Query(..., description="YYYY-MM-DD format"),
    service: EventService = Depends(get_event_service),
):
    """Get weekly summary of events"""
    summary = service.get_weekly_summary(baby_id, start_date)
    return summary
