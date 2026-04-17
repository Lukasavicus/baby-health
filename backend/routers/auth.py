"""Authentication endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from models.auth import LoginRequest, LoginResponse, UserInfo, TokenPayload
from services.auth_service import verify_password, create_access_token
from deps import get_user_service, get_current_user
from services.user_service import UserService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    user_svc: UserService = Depends(get_user_service),
):
    user = user_svc.get_by_username(body.username)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(
        user_id=user.id,
        username=user.username,
        profile_dir=user.profile_dir,
        caregiver_id=user.caregiver_id,
    )

    return LoginResponse(
        access_token=token,
        user=UserInfo(
            id=user.id,
            username=user.username,
            display_name=user.display_name,
            profile_dir=user.profile_dir,
            caregiver_id=user.caregiver_id,
        ),
    )


@router.get("/me", response_model=UserInfo)
async def me(current: TokenPayload = Depends(get_current_user)):
    return UserInfo(
        id=current.sub,
        username=current.username,
        display_name=current.username,
        profile_dir=current.profile_dir,
        caregiver_id=current.caregiver_id,
    )
