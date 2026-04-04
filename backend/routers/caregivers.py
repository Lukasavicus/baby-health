"""Caregivers API endpoints"""
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from models.caregiver import CaregiverCreate, CaregiverUpdate, CaregiverResponse, Caregiver
from repositories import BaseRepository

router = APIRouter(prefix="/api/caregivers", tags=["caregivers"])


def get_repository() -> BaseRepository:
    """Dependency injection for repository"""
    from config import settings
    from repositories import JsonRepository
    from pathlib import Path

    if settings.storage_type == "json":
        return JsonRepository(settings.data_dir)
    else:
        raise ValueError(f"Unsupported storage type: {settings.storage_type}")


@router.get("", response_model=List[CaregiverResponse])
async def list_caregivers(repo: BaseRepository = Depends(get_repository)):
    """List all caregivers"""
    caregivers = repo.get_all("caregiver")
    return caregivers


@router.post("", response_model=CaregiverResponse)
async def create_caregiver(
    caregiver_data: CaregiverCreate,
    repo: BaseRepository = Depends(get_repository),
):
    """Create a new caregiver"""
    from datetime import datetime
    import uuid

    caregiver = Caregiver(
        id=uuid.uuid4().hex,
        name=caregiver_data.name,
        role=caregiver_data.role,
        avatar_color=caregiver_data.avatar_color,
        created_at=datetime.utcnow(),
    )

    created = repo.create("caregiver", caregiver.model_dump())
    return created


@router.put("/{caregiver_id}", response_model=CaregiverResponse)
async def update_caregiver(
    caregiver_id: str,
    caregiver_data: CaregiverUpdate,
    repo: BaseRepository = Depends(get_repository),
):
    """Update a caregiver"""
    existing = repo.get_by_id("caregiver", caregiver_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    updates = caregiver_data.model_dump(exclude_unset=True)
    updated = repo.update("caregiver", caregiver_id, updates)

    if not updated:
        raise HTTPException(status_code=400, detail="Failed to update caregiver")

    return updated


@router.delete("/{caregiver_id}")
async def delete_caregiver(
    caregiver_id: str, repo: BaseRepository = Depends(get_repository)
):
    """Delete a caregiver"""
    existing = repo.get_by_id("caregiver", caregiver_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    success = repo.delete("caregiver", caregiver_id)

    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete caregiver")

    return {"message": "Caregiver deleted successfully"}
