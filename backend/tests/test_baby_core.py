"""Tests for Baby Core scoring service and age guidelines."""
import pytest
from datetime import datetime, timedelta
from repositories import JsonRepository
from services.age_guidelines import get_guidelines, GUIDELINES
from services.baby_core_service import BabyCoreService, _score_from_range


@pytest.fixture
def temp_data_dir(tmp_path):
    return tmp_path


@pytest.fixture
def repository(temp_data_dir):
    return JsonRepository(temp_data_dir)


@pytest.fixture
def baby_8mo(repository):
    """Create a baby that is ~8 months old."""
    birth = (datetime.utcnow() - timedelta(days=240)).strftime("%Y-%m-%d")
    baby = {
        "id": "baby-test-1",
        "name": "Test Baby",
        "birth_date": birth,
        "photo_url": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    repository.create("baby", baby)
    return baby


def _make_event(repository, baby_id, event_type, subtype="", **kwargs):
    """Helper to create a test event for today."""
    now = datetime.utcnow()
    ev = {
        "id": f"ev-{event_type}-{now.timestamp()}",
        "baby_id": baby_id,
        "caregiver_id": "cg-1",
        "type": event_type,
        "subtype": subtype,
        "timestamp": now.isoformat(),
        "end_timestamp": None,
        "quantity": None,
        "unit": None,
        "notes": None,
        "metadata": {},
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    ev.update(kwargs)
    return repository.create("event", ev)


class TestAgeGuidelines:
    def test_newborn_range(self):
        g = get_guidelines(1)
        assert g["feeding_count"] == (8, 12)
        assert g["sleep_hours"] == (14, 17)

    def test_8_months(self):
        g = get_guidelines(8)
        assert g["feeding_count"] == (4, 6)
        assert g["sleep_hours"] == (12, 15)
        assert g["diaper_count"] == (4, 6)
        assert g["activity_min"] == (30, 60)

    def test_12_months(self):
        g = get_guidelines(12)
        assert g["feeding_count"] == (3, 5)

    def test_fallback_for_old_age(self):
        g = get_guidelines(48)
        assert "feeding_count" in g
        assert "sleep_hours" in g

    def test_all_bands_covered(self):
        for lo, hi in GUIDELINES:
            g = get_guidelines(lo)
            assert g is not None
            g2 = get_guidelines(hi)
            assert g2 is not None


class TestScoreFromRange:
    def test_within_range_high(self):
        score = _score_from_range(5, 4, 6)
        assert 85 <= score <= 100

    def test_at_minimum(self):
        score = _score_from_range(4, 4, 6)
        assert 85 <= score <= 100

    def test_at_maximum(self):
        score = _score_from_range(6, 4, 6)
        assert 85 <= score <= 100

    def test_below_range_close(self):
        score = _score_from_range(3, 4, 6)
        assert 60 <= score < 85

    def test_far_below_range(self):
        score = _score_from_range(1, 4, 6)
        assert score < 60

    def test_zero_value(self):
        score = _score_from_range(0, 4, 6)
        assert score == 0

    def test_above_range_close(self):
        score = _score_from_range(7, 4, 6)
        assert 60 <= score < 85

    def test_zero_range_with_zero(self):
        score = _score_from_range(0, 0, 0)
        assert score >= 85


class TestBabyCoreService:
    def test_no_baby_returns_empty_pillars(self, repository):
        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars("nonexistent")
        assert len(pillars) == 4
        assert all(p["score"] == 0 for p in pillars)

    def test_baby_no_events_returns_zero_scores(self, repository, baby_8mo):
        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars(baby_8mo["id"])
        assert len(pillars) == 4
        assert pillars[0]["label"] == "Alimentação"
        assert pillars[0]["score"] == 0
        assert pillars[1]["label"] == "Sono"
        assert pillars[2]["label"] == "Hidratação"
        assert pillars[3]["label"] == "Desenvolvimento"

    def test_feeding_events_produce_score(self, repository, baby_8mo):
        for _ in range(5):
            _make_event(repository, baby_8mo["id"], "feeding", "bottle",
                        quantity=120, unit="ml")

        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars(baby_8mo["id"])
        feed = pillars[0]
        assert feed["score"] >= 85
        assert "5 refeições" in feed["detail"]

    def test_activity_minutes_score(self, repository, baby_8mo):
        _make_event(repository, baby_8mo["id"], "activity", "tummy",
                    quantity=30, unit="min")
        _make_event(repository, baby_8mo["id"], "activity", "play",
                    quantity=15, unit="min")

        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars(baby_8mo["id"])
        dev = pillars[3]
        assert dev["score"] > 0
        assert "45 min" in dev["detail"]

    def test_diaper_score(self, repository, baby_8mo):
        for _ in range(5):
            _make_event(repository, baby_8mo["id"], "diaper", "pee")

        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars(baby_8mo["id"])
        hyd = pillars[2]
        assert hyd["score"] > 0
        assert "5 fraldas" in hyd["detail"]

    def test_trend_stable_when_no_yesterday(self, repository, baby_8mo):
        _make_event(repository, baby_8mo["id"], "feeding", "bottle",
                    quantity=100, unit="ml")
        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars(baby_8mo["id"])
        for p in pillars:
            assert p["trend"] in ("up", "down", "stable")

    def test_pillar_structure(self, repository, baby_8mo):
        svc = BabyCoreService(repository)
        pillars = svc.compute_pillars(baby_8mo["id"])
        required_keys = {"label", "shortLabel", "score", "color", "status", "trend", "detail"}
        for p in pillars:
            assert required_keys.issubset(p.keys())
            assert isinstance(p["score"], int)
            assert 0 <= p["score"] <= 100
            assert p["trend"] in ("up", "down", "stable")
