"""Public onboarding: new profile + user (mock email verification)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from deps import get_user_service
from models.onboarding import (
    CheckEmailRequest,
    CheckEmailResponse,
    OnboardingCompleteRequest,
    SendVerificationRequest,
    SendVerificationResponse,
)
from models.auth import LoginResponse
from services.onboarding_service import run_onboarding_complete
from services.user_service import UserService

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


@router.post("/send-verification", response_model=SendVerificationResponse)
async def send_verification(_body: SendVerificationRequest):
    """Mock: no email is sent. UI uses demo code when mock mode is enabled."""
    return SendVerificationResponse(ok=True, mock=True)


@router.post("/check-email", response_model=CheckEmailResponse)
async def check_email(body: CheckEmailRequest, user_svc: UserService = Depends(get_user_service)):
    return CheckEmailResponse(available=not user_svc.email_taken(str(body.email)))


@router.post("/complete", response_model=LoginResponse)
async def complete_onboarding(
    body: OnboardingCompleteRequest,
    user_svc: UserService = Depends(get_user_service),
):
    # TODO: rate-limit this public endpoint
    try:
        return run_onboarding_complete(body, user_svc)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
