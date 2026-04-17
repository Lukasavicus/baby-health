"""Babies API endpoints"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from models.baby import BabyCreate, BabyUpdate, BabyResponse, Baby
from repositories import BaseRepository
from deps import get_profile_repository

router = APIRouter(prefix="/api/babies", tags=["babies"])


@router.get("", response_model=List[BabyResponse])
async def list_babies(repo: BaseRepository = Depends(get_profile_repository)):
    """List all babies"""
    babies = repo.get_all("baby")
    return babies


@router.post("", response_model=BabyResponse)
async def create_baby(
    baby_data: BabyCreate, repo: BaseRepository = Depends(get_profile_repository)
):
    """Create a new baby"""
    from datetime import datetime
    import uuid

    baby = Baby(
        id=uuid.uuid4().hex,
        name=baby_data.name,
        birth_date=baby_data.birth_date,
        photo_url=baby_data.photo_url,
        gender=baby_data.gender,
        created_at=datetime.utcnow(),
    )

    created = repo.create("baby", baby.model_dump())
    return created


@router.get("/{baby_id}", response_model=BabyResponse)
async def get_baby(baby_id: str, repo: BaseRepository = Depends(get_profile_repository)):
    """Get a baby by ID"""
    baby = repo.get_by_id("baby", baby_id)
    if not baby:
        raise HTTPException(status_code=404, detail="Baby not found")
    return baby


@router.put("/{baby_id}", response_model=BabyResponse)
async def update_baby(
    baby_id: str,
    baby_data: BabyUpdate,
    repo: BaseRepository = Depends(get_profile_repository),
):
    """Update a baby"""
    existing = repo.get_by_id("baby", baby_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Baby not found")

    updates = baby_data.model_dump(exclude_unset=True)
    updated = repo.update("baby", baby_id, updates)

    if not updated:
        raise HTTPException(status_code=400, detail="Failed to update baby")

    return updated
