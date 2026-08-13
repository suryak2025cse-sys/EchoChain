from fastapi import APIRouter, Depends, Request, Header
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse,
    UserProfileUpdateRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])


@router.post("/register", response_model=TokenResponse, summary="Register User")
def register(
    req: UserRegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    return AuthService.register_user(db, req, ip_address=ip_address)


@router.post("/login", response_model=TokenResponse, summary="User Login")
def login(
    req: UserLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    return AuthService.login_user(db, req, ip_address=ip_address)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh Access Token")
def refresh(
    req: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    return AuthService.refresh_access_token(db, req.refresh_token)


@router.post("/logout", response_model=MessageResponse, summary="User Logout")
def logout(
    request: Request,
    refresh_req: Optional[RefreshTokenRequest] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    token_str = refresh_req.refresh_token if refresh_req else None
    AuthService.logout(db, token_str, current_user.id, ip_address=ip_address)
    return MessageResponse(message="Successfully logged out.")


@router.get("/me", response_model=UserProfileResponse, summary="Get Current User Profile")
def get_me(current_user: User = Depends(get_current_active_user)):
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.name if current_user.role else "CONSUMER",
        organization=current_user.organization,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at
    )


@router.put("/me", response_model=UserProfileResponse, summary="Update Profile")
def update_me(
    req: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AuthService.update_profile(db, current_user.id, req)


@router.post("/forgot-password", response_model=MessageResponse, summary="Request Password Reset")
def forgot_password(
    req: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    reset_token = AuthService.forgot_password(db, req)
    return MessageResponse(
        message=f"If an account exists, password reset instructions have been generated. (Dev Reset Token: {reset_token})"
    )


@router.post("/reset-password", response_model=MessageResponse, summary="Reset Password With Token")
def reset_password(
    req: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    AuthService.reset_password(db, req)
    return MessageResponse(message="Password has been reset successfully.")


# Role Protected Endpoints Demonstration & Verification
@router.get("/producer-only", response_model=MessageResponse, summary="Producer Only API Endpoint")
def producer_only_route(current_user: User = Depends(require_roles(["PRODUCER", "ADMIN"]))):
    return MessageResponse(message=f"Access granted to Producer area for user {current_user.email}")


@router.get("/certifier-only", response_model=MessageResponse, summary="Certifier Only API Endpoint")
def certifier_only_route(current_user: User = Depends(require_roles(["CERTIFIER", "ADMIN"]))):
    return MessageResponse(message=f"Access granted to Certifier audit area for user {current_user.email}")


@router.get("/admin-only", response_model=MessageResponse, summary="Admin Only Governance Endpoint")
def admin_only_route(current_user: User = Depends(require_roles(["ADMIN"]))):
    return MessageResponse(message=f"Access granted to System Admin area for user {current_user.email}")
