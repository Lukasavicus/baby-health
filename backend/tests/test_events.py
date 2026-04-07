"""Tests for event service"""
import pytest
from datetime import datetime, timedelta
from pathlib import Path
from repositories import JsonRepository
from services import EventService
from models.event import Event
from models.baby import Baby
from models.caregiver import Caregiver


@pytest.fixture
def temp_data_dir(tmp_path):
    """Create temporary data directory for tests"""
    return tmp_path


@pytest.fixture
def repository(temp_data_dir):
    """Create a test repository"""
    return JsonRepository(temp_data_dir)


@pytest.fixture
def test_data(repository):
    """Create test data"""
    # Create baby
    baby = Baby(
        id="test-baby-1",
        name="Test Baby",
        birth_date="2024-01-01",
        created_at=datetime.utcnow(),
    )
    repository.create("baby", baby.model_dump())

    # Create caregiver
    caregiver = Caregiver(
        id="test-cg-1",
        name="Test Caregiver",
        role="mãe",
        avatar_color="blue",
        created_at=datetime.utcnow(),
    )
    repository.create("caregiver", caregiver.model_dump())

    return {"baby_id": baby.id, "caregiver_id": caregiver.id}


def test_create_event(repository, test_data):
    """Test creating an event"""
    event = Event(
        id="event-1",
        baby_id=test_data["baby_id"],
        caregiver_id=test_data["caregiver_id"],
        type="feeding",
        subtype="bottle_formula",
        timestamp=datetime.utcnow(),
        quantity=120,
        unit="ml",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    created = repository.create("event", event.model_dump())

    assert created["id"] == "event-1"
    assert created["type"] == "feeding"
    assert created["quantity"] == 120


def test_get_event(repository, test_data):
    """Test getting an event"""
    event = Event(
        id="event-2",
        baby_id=test_data["baby_id"],
        caregiver_id=test_data["caregiver_id"],
        type="diaper",
        subtype="wet",
        timestamp=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    repository.create("event", event.model_dump())
    retrieved = repository.get_by_id("event", "event-2")

    assert retrieved is not None
    assert retrieved["id"] == "event-2"
    assert retrieved["type"] == "diaper"


def test_event_service_daily_summary(repository, test_data):
    """Test daily summary calculation"""
    service = EventService(repository)

    # Fixed midday UTC so offsets stay on the same calendar day (filter is date-only)
    now = datetime.utcnow().replace(hour=12, minute=0, second=0, microsecond=0)
    today = now.strftime("%Y-%m-%d")

    events_data = [
        {
            "id": "e1",
            "type": "feeding",
            "subtype": "bottle_formula",
            "quantity": 120,
            "unit": "ml",
            "timestamp": now.isoformat(),
        },
        {
            "id": "e2",
            "type": "feeding",
            "subtype": "bottle_formula",
            "quantity": 130,
            "unit": "ml",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
        },
        {
            "id": "e3",
            "type": "diaper",
            "subtype": "wet",
            "timestamp": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": "e4",
            "type": "sleep",
            "subtype": "nap",
            "timestamp": (now - timedelta(hours=1)).isoformat(),
            "end_timestamp": (now - timedelta(minutes=30)).isoformat(),
        },
    ]

    for ed in events_data:
        event = Event(
            id=ed["id"],
            baby_id=test_data["baby_id"],
            caregiver_id=test_data["caregiver_id"],
            type=ed["type"],
            subtype=ed["subtype"],
            timestamp=datetime.fromisoformat(ed["timestamp"]),
            end_timestamp=datetime.fromisoformat(ed.get("end_timestamp"))
            if ed.get("end_timestamp")
            else None,
            quantity=ed.get("quantity"),
            unit=ed.get("unit"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        repository.create("event", event.model_dump())

    summary = service.get_daily_summary(test_data["baby_id"], today)

    assert summary["feeding_count"] == 2
    assert summary["feeding_total_ml"] == 250
    assert summary["hydration_total_ml"] == 0
    assert summary["bath_count"] == 0
    assert summary["health_count"] == 0
    assert summary["diaper_count"] == 1
    assert summary["sleep_hours"] > 0


def test_list_events_by_baby(repository, test_data):
    """Test listing events by baby"""
    now = datetime.utcnow()

    for i in range(3):
        event = Event(
            id=f"event-{i}",
            baby_id=test_data["baby_id"],
            caregiver_id=test_data["caregiver_id"],
            type="feeding",
            subtype="bottle_formula",
            timestamp=now - timedelta(hours=i),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        repository.create("event", event.model_dump())

    events = repository.list_by_field("event", "baby_id", test_data["baby_id"])

    assert len(events) == 3


if __name__ == "__main__":
    pytest.main([__file__])
