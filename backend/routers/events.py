"""Events API endpoints"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import ValidationError
from models.event import EventIncoming, EventCreate, EventUpdate, EventResponse, Event
from services import EventService
from services.event_normalization import merge_and_normalize_event, normalize_event_payload
from repositories import BaseRepository
from deps import get_profile_repository

router = APIRouter(prefix="/api/events", tags=["events"])


def get_event_service(repo: BaseRepository = Depends(get_profile_repository)) -> EventService:
    """Dependency injection for event service"""
    return EventService(repo)


@router.get("", response_model=List[EventResponse])
async def list_events(
    baby_id: str = Query(..., description="Baby ID"),
    date: Optional[str] = Query(None, description="YYYY-MM-DD format (single day)"),
    start_date: Optional[str] = Query(None, description="Range start YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="Range end YYYY-MM-DD"),
    event_type: Optional[str] = Query(None, description="Event type to filter"),
    caregiver_id: Optional[str] = Query(None, description="Caregiver ID to filter"),
    service: EventService = Depends(get_event_service),
):
    """List events with optional filters"""
    events = service.get_events_for_baby(
        baby_id=baby_id,
        date=date,
        start_date=start_date,
        end_date=end_date,
        event_type=event_type,
        caregiver_id=caregiver_id,
    )
    return events


@router.post("", response_model=EventResponse)
async def create_event(
    event_data: EventIncoming,
    service: EventService = Depends(get_event_service),
):
    """Create a new event (accepts App Design aliases; stored canonical)."""
    import uuid

    try:
        normalized = normalize_event_payload(event_data.model_dump())
        canonical = EventCreate.model_validate(normalized)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=e.errors())

    event = Event(
        id=uuid.uuid4().hex,
        baby_id=canonical.baby_id,
        caregiver_id=canonical.caregiver_id,
        type=canonical.type,
        subtype=canonical.subtype,
        timestamp=canonical.timestamp,
        end_timestamp=canonical.end_timestamp,
        quantity=canonical.quantity,
        unit=canonical.unit,
        notes=canonical.notes,
        metadata=canonical.metadata,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    created = service.create_event(event.model_dump())
    return created


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
    try:
        normalized = merge_and_normalize_event(existing, updates)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    payload = {k: v for k, v in normalized.items() if k != "id"}
    updated = service.update_event(event_id, payload)

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
