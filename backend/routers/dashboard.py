"""Dashboard API endpoints"""
from fastapi import APIRouter, HTTPException, Depends, Query
from services import DashboardService
from repositories import BaseRepository
from deps import get_repository

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def get_dashboard_service(
    repo: BaseRepository = Depends(get_repository),
) -> DashboardService:
    """Dependency injection for dashboard service"""
    return DashboardService(repo)


@router.get("")
async def get_dashboard(
    baby_id: str = Query(..., description="Baby ID"),
    service: DashboardService = Depends(get_dashboard_service),
):
    """Get comprehensive dashboard data for a baby"""
    dashboard = service.get_dashboard_data(baby_id)

    if "error" in dashboard:
        raise HTTPException(status_code=404, detail=dashboard["error"])

    return dashboard


@router.get("/hero")
async def get_hero_card(
    baby_id: str = Query(..., description="Baby ID"),
    service: DashboardService = Depends(get_dashboard_service),
):
    """Get hero card data with quick stats"""
    hero = service.get_hero_card_data(baby_id)

    if "error" in hero:
        raise HTTPException(status_code=404, detail=hero["error"])

    return hero
