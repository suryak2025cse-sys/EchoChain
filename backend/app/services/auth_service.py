import secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token_string
from app.core.config import settings
from app.repositories.user_repository import user_repository
from app.repositories.refresh_token_repository import refresh_token_repository
from app.repositories.audit_log_repository import audit_log_repository
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserProfileResponse,
    UserProfileUpdateRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)


class AuthService:
    @staticmethod
    def register_user(db: Session, req: UserRegisterRequest, ip_address: Optional[str] = None) -> TokenResponse:
        # Seed default roles if database is fresh
        user_repository.seed_roles_if_empty(db)

        # Check existing email
        existing_user = user_repository.get_by_email(db, req.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists."
            )

        # Retrieve Role
        role = user_repository.get_role_by_name(db, req.role.value)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{req.role.value}' does not exist."
            )

        # Hash password and store
        hashed_pwd = hash_password(req.password)
        new_user = user_repository.create(
            db,
            obj_in_data={
                "email": req.email.lower().strip(),
                "password_hash": hashed_pwd,
                "full_name": req.full_name,
                "organization": req.organization,
                "role_id": role.id,
                "is_active": True,
                "is_verified": False,
            }
        )

        # Generate tokens
        access_token = create_access_token(subject=new_user.id, role=role.name)
        refresh_str = create_refresh_token_string()
        refresh_token_repository.create_token(db, user_id=new_user.id, token_str=refresh_str)

        # Audit log
        audit_log_repository.log(
            db,
            action="USER_REGISTER",
            user_id=new_user.id,
            ip_address=ip_address,
            details=f"Registered with role {role.name}"
        )

        user_profile = UserProfileResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            role=role.name,
            organization=new_user.organization,
            is_active=new_user.is_active,
            is_verified=new_user.is_verified,
            created_at=new_user.created_at
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_str,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_profile
        )

    @staticmethod
    def login_user(db: Session, req: UserLoginRequest, ip_address: Optional[str] = None) -> TokenResponse:
        clean_email = req.email.lower().strip() if req.email else ""
        user = user_repository.get_by_email(db, clean_email)
        if not user or not verify_password(req.password, user.password_hash):
            audit_log_repository.log(
                db,
                action="LOGIN_FAILED",
                ip_address=ip_address,
                details=f"Failed login attempt for email {req.email}"
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )

        role_name = user.role.name if user.role else "CONSUMER"
        access_token = create_access_token(subject=user.id, role=role_name)
        refresh_str = create_refresh_token_string()
        refresh_token_repository.create_token(db, user_id=user.id, token_str=refresh_str)

        audit_log_repository.log(
            db,
            action="USER_LOGIN",
            user_id=user.id,
            ip_address=ip_address,
            details="User logged in successfully"
        )

        user_profile = UserProfileResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=role_name,
            organization=user.organization,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_str,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_profile
        )

    @staticmethod
    def refresh_access_token(db: Session, refresh_token_str: str) -> TokenResponse:
        token_record = refresh_token_repository.get_valid_token(db, refresh_token_str)
        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user = token_record.user
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP401_UNAUTHORIZED,
                detail="User inactive or removed."
            )

        role_name = user.role.name if user.role else "CONSUMER"
        new_access_token = create_access_token(subject=user.id, role=role_name)

        user_profile = UserProfileResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=role_name,
            organization=user.organization,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_token_str,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_profile
        )

    @staticmethod
    def logout(db: Session, refresh_token_str: Optional[str], user_id: int, ip_address: Optional[str] = None):
        if refresh_token_str:
            refresh_token_repository.revoke_token(db, refresh_token_str)
        else:
            refresh_token_repository.revoke_all_for_user(db, user_id)

        audit_log_repository.log(
            db,
            action="USER_LOGOUT",
            user_id=user_id,
            ip_address=ip_address,
            details="User logged out"
        )

    @staticmethod
    def update_profile(db: Session, user_id: int, req: UserProfileUpdateRequest) -> UserProfileResponse:
        user = user_repository.get(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        if req.full_name is not None:
            user.full_name = req.full_name
        if req.organization is not None:
            user.organization = req.organization

        db.commit()
        db.refresh(user)

        return UserProfileResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role.name if user.role else "CONSUMER",
            organization=user.organization,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at
        )

    @staticmethod
    def forgot_password(db: Session, req: ForgotPasswordRequest) -> str:
        user = user_repository.get_by_email(db, req.email)
        if not user:
            # Return uniform message to prevent account enumeration
            return "If an account with that email exists, password reset instructions have been generated."

        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
        db.commit()

        audit_log_repository.log(
            db,
            action="FORGOT_PASSWORD_REQUESTED",
            user_id=user.id,
            details=f"Generated reset token: {token[:8]}..."
        )

        return token  # Returned for testing/architecture response

    @staticmethod
    def reset_password(db: Session, req: ResetPasswordRequest):
        user = user_repository.get_by_reset_token(db, req.token)
        if not user or not user.reset_token_expires_at or user.reset_token_expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token."
            )

        user.password_hash = hash_password(req.new_password)
        user.reset_token = None
        user.reset_token_expires_at = None
        db.commit()

        audit_log_repository.log(
            db,
            action="PASSWORD_RESET_SUCCESS",
            user_id=user.id,
            details="User reset password using reset token"
        )
