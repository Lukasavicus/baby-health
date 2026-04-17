"""Daily summary: bath (dual rule), hydration ml, health counts."""
import pytest
from datetime import datetime

from repositories import JsonRepository
from services import EventService
from models.event import Event
from models.baby import Baby
from models.caregiver import Caregiver


@pytest.fixture
def repo_and_ids(tmp_path):
    repository = JsonRepository(tmp_path)
    baby = Baby(
        id="b1",
        name="Test",
        birth_date="2024-01-01",
        created_at=datetime.utcnow(),
    )
    repository.create("baby", baby.model_dump())
    cg = Caregiver(
        id="c1",
        name="Mãe",
        role="mãe",
        avatar_color="blue",
        created_at=datetime.utcnow(),
    )
    repository.create("caregiver", cg.model_dump())
    return repository, baby.id, cg.id


def test_bath_count_legacy_and_new(repo_and_ids):
    repository, baby_id, cg_id = repo_and_ids
    noon = datetime(2026, 4, 5, 12, 0, 0)
    for eid, etype, sub in [
        ("e1", "bath", "bath"),
        ("e2", "activity", "bath"),
    ]:
        ev = Event(
            id=eid,
            baby_id=baby_id,
            caregiver_id=cg_id,
            type=etype,
            subtype=sub,
            timestamp=noon,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        repository.create("event", ev.model_dump())

    service = EventService(repository)
    s = service.get_daily_summary(baby_id, "2026-04-05")
    assert s["bath_count"] == 2


def test_hydration_total_ml_and_health(repo_and_ids):
    repository, baby_id, cg_id = repo_and_ids
    noon = datetime(2026, 4, 5, 12, 0, 0)
    events = [
        Event(
            id="h1",
            baby_id=baby_id,
            caregiver_id=cg_id,
            type="hydration",
            subtype="water",
            timestamp=noon,
            quantity=60,
            unit="ml",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        Event(
            id="h2",
            baby_id=baby_id,
            caregiver_id=cg_id,
            type="hydration",
            subtype="water",
            timestamp=noon,
            quantity=40,
            unit="ml",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        Event(
            id="hl",
            baby_id=baby_id,
            caregiver_id=cg_id,
            type="health",
            subtype="vitamin",
            timestamp=noon,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
        Event(
            id="m1",
            baby_id=baby_id,
            caregiver_id=cg_id,
            type="medication",
            subtype="dose",
            timestamp=noon,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ),
    ]
    for ev in events:
        repository.create("event", ev.model_dump())

    service = EventService(repository)
    s = service.get_daily_summary(baby_id, "2026-04-05")
    assert s["hydration_count"] == 2
    assert s["hydration_total_ml"] == 100
    assert s["health_count"] == 2
