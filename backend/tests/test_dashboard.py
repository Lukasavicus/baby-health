"""Tests for dashboard service"""
import pytest
from datetime import datetime, timedelta
from repositories import JsonRepository
from services import DashboardService
from models.baby import Baby
from models.caregiver import Caregiver
from models.event import Event


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
    """Create test data with baby, caregivers, and events"""
    # Create baby
    baby = Baby(
        id="test-baby-1",
        name="Emma",
        birth_date="2024-01-01",
        created_at=datetime.utcnow(),
    )
    repository.create("baby", baby.model_dump())

    # Create caregivers
    caregivers_data = [
        {"id": "cg-1", "name": "Maria", "role": "mãe", "avatar_color": "blue"},
        {"id": "cg-2", "name": "João", "role": "pai", "avatar_color": "green"},
    ]

    for cg_data in caregivers_data:
        caregiver = Caregiver(
            id=cg_data["id"],
            name=cg_data["name"],
            role=cg_data["role"],
            avatar_color=cg_data["avatar_color"],
            created_at=datetime.utcnow(),
        )
        repository.create("caregiver", caregiver.model_dump())

    return {"baby_id": baby.id, "caregiver_ids": ["cg-1", "cg-2"]}


def test_get_hero_card_data(repository, test_data):
    """Test getting hero card data"""
    now = datetime.utcnow()

    # Create some events
    event = Event(
        id="e1",
        baby_id=test_data["baby_id"],
        caregiver_id=test_data["caregiver_ids"][0],
        type="feeding",
        subtype="bottle_formula",
        timestamp=now - timedelta(hours=2),
        quantity=120,
        unit="ml",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    repository.create("event", event.model_dump())

    service = DashboardService(repository)
    hero = service.get_hero_card_data(test_data["baby_id"])

    assert hero["baby_name"] == "Emma"
    assert hero["age_days"] > 0
    assert "summary" in hero


def test_get_dashboard_data(repository, test_data):
    """Test getting complete dashboard data"""
    now = datetime.utcnow()

    # Create events
    events_data = [
        {
            "id": "e1",
            "type": "feeding",
            "subtype": "bottle_formula",
            "quantity": 120,
            "timestamp": now - timedelta(hours=3),
        },
        {
            "id": "e2",
            "type": "diaper",
            "subtype": "wet",
            "timestamp": now - timedelta(hours=2),
        },
    ]

    for ed in events_data:
        event = Event(
            id=ed["id"],
            baby_id=test_data["baby_id"],
            caregiver_id=test_data["caregiver_ids"][0],
            type=ed["type"],
            subtype=ed["subtype"],
            timestamp=datetime.fromisoformat(ed["timestamp"].isoformat())
            if isinstance(ed["timestamp"], datetime)
            else ed["timestamp"],
            quantity=ed.get("quantity"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        repository.create("event", event.model_dump())

    service = DashboardService(repository)
    dashboard = service.get_dashboard_data(test_data["baby_id"])

    assert "baby" in dashboard
    assert "summary" in dashboard
    assert "recent_events" in dashboard
    assert "caregivers" in dashboard
    assert dashboard["baby"]["name"] == "Emma"


if __name__ == "__main__":
    pytest.main([__file__])
