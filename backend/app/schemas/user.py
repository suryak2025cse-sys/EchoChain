from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRoleEnum(str, Enum):
    PRODUCER = "PRODUCER"
    CONSUMER = "CONSUMER"
    CERTIFIER = "CERTIFIER"
    ADMIN = "ADMIN"


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    full_name: str = Field(..., min_length=2)
    role: UserRoleEnum = UserRoleEnum.CONSUMER
    organization: Optional[str] = None


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    organization: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfileResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    organization: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class MessageResponse(BaseModel):
    message: str
