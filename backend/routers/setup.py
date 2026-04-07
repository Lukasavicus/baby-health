"""Setup API endpoints for initial configuration"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
import uuid

from models.baby import Baby
from models.caregiver import Caregiver
from repositories import BaseRepository
from deps import get_repository

router = APIRouter(prefix="/api/setup", tags=["setup"])


class CaregiverSetupData(BaseModel):
    """Caregiver data for setup"""

    name: str
    role: str
    avatar_color: str = "blue"


class BabySetupData(BaseModel):
    """Baby data for setup"""

    name: str
    birth_date: str
    photo_url: str = None


class SetupRequest(BaseModel):
    """Initial setup request"""

    baby: BabySetupData
    caregivers: List[CaregiverSetupData]


class SetupResponse(BaseModel):
    """Setup response"""

    baby: dict
    caregivers: list
    message: str


@router.post("", response_model=SetupResponse)
async def setup(
    setup_data: SetupRequest,
    repo: BaseRepository = Depends(get_repository),
):
    """Perform initial setup with baby and caregivers"""

    # Create baby
    baby_id = uuid.uuid4().hex
    baby = Baby(
        id=baby_id,
        name=setup_data.baby.name,
        birth_date=setup_data.baby.birth_date,
        photo_url=setup_data.baby.photo_url,
        created_at=datetime.utcnow(),
    )

    created_baby = repo.create("baby", baby.model_dump())

    # Create caregivers
    caregivers = []
    for cg_data in setup_data.caregivers:
        caregiver_id = uuid.uuid4().hex
        caregiver = Caregiver(
            id=caregiver_id,
            name=cg_data.name,
            role=cg_data.role,
            avatar_color=cg_data.avatar_color,
            created_at=datetime.utcnow(),
        )

        created_cg = repo.create("caregiver", caregiver.model_dump())
        caregivers.append(created_cg)

    return SetupResponse(
        baby=created_baby,
        caregivers=caregivers,
        message="Setup completed successfully",
    )


@router.post("/seed")
async def seed_demo_data(repo: BaseRepository = Depends(get_repository)):
    """Seed database with demo data for testing"""
    from datetime import datetime, timedelta

    # Create a demo baby
    baby_id = uuid.uuid4().hex
    baby = Baby(
        id=baby_id,
        name="Emma",
        birth_date="2024-01-15",
        photo_url=None,
        created_at=datetime.utcnow(),
    )
    repo.create("baby", baby.model_dump())

    # Create demo caregivers
    caregivers_data = [
        {"name": "Maria", "role": "mãe", "avatar_color": "blue"},
        {"name": "João", "role": "pai", "avatar_color": "green"},
        {"name": "Nana", "role": "babá", "avatar_color": "purple"},
    ]

    caregiver_ids = []
    for cg_data in caregivers_data:
        caregiver_id = uuid.uuid4().hex
        caregiver = Caregiver(
            id=caregiver_id,
            name=cg_data["name"],
            role=cg_data["role"],
            avatar_color=cg_data["avatar_color"],
            created_at=datetime.utcnow(),
        )
        repo.create("caregiver", caregiver.model_dump())
        caregiver_ids.append(caregiver_id)

    # Create demo events
    from models.event import Event

    now = datetime.utcnow()

    events_data = [
        {
            "type": "feeding",
            "subtype": "bottle_formula",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
            "quantity": 120,
            "unit": "ml",
            "notes": "Baby was hungry",
            "metadata": {},
        },
        {
            "type": "diaper",
            "subtype": "wet",
            "timestamp": (now - timedelta(hours=2, minutes=30)).isoformat(),
            "quantity": None,
            "unit": None,
            "notes": None,
            "metadata": {},
        },
        {
            "type": "sleep",
            "subtype": "nap",
            "timestamp": (now - timedelta(hours=2)).isoformat(),
            "end_timestamp": (now - timedelta(hours=1)).isoformat(),
            "quantity": None,
            "unit": None,
            "notes": None,
            "metadata": {"awakenings": 1},
        },
        {
            "type": "activity",
            "subtype": "play",
            "timestamp": (now - timedelta(minutes=30)).isoformat(),
            "end_timestamp": now.isoformat(),
            "quantity": None,
            "unit": None,
            "notes": "Enjoyed playing with toys",
            "metadata": {},
        },
    ]

    for event_data in events_data:
        event_id = uuid.uuid4().hex
        event = Event(
            id=event_id,
            baby_id=baby_id,
            caregiver_id=caregiver_ids[0],
            type=event_data["type"],
            subtype=event_data["subtype"],
            timestamp=datetime.fromisoformat(event_data["timestamp"]),
            end_timestamp=datetime.fromisoformat(event_data["end_timestamp"])
            if event_data.get("end_timestamp")
            else None,
            quantity=event_data["quantity"],
            unit=event_data["unit"],
            notes=event_data["notes"],
            metadata=event_data["metadata"],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        repo.create("event", event.model_dump())

    return {
        "message": "Demo data seeded successfully",
        "baby_id": baby_id,
        "caregiver_ids": caregiver_ids,
    }
