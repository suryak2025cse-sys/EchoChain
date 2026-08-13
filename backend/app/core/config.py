import os
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EchoChain Provenance Platform"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # JWT Authentication & Security
    SECRET_KEY: str = "echochain_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Supabase & Database Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    # IPFS Pinata Configuration
    PINATA_API_KEY: Optional[str] = None
    PINATA_SECRET_API_KEY: Optional[str] = None
    PINATA_JWT: Optional[str] = None
    IPFS_GATEWAY_URL: str = "https://gateway.pinata.cloud/ipfs"

    # Polygon Testnet Blockchain Configuration
    POLYGON_RPC_URL: Optional[str] = None
    POLYGON_PRIVATE_KEY: Optional[str] = None
    POLYGON_CONTRACT_ADDRESS: str = "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7"
    POLYGON_NETWORK: str = "Polygon Amoy Testnet"

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "echochain"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
