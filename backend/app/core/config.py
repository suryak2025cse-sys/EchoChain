import os
from typing import List, Union, Optional
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "EchoChain Provenance Platform"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False

    # CORS Configuration for Vercel & Live Server
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*"
    ]

    # JWT Authentication & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "echochain_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Supabase & Database Configuration
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", None)
    SUPABASE_ANON_KEY: Optional[str] = os.getenv("SUPABASE_ANON_KEY", None)

    # IPFS Pinata Configuration
    PINATA_API_KEY: Optional[str] = os.getenv("PINATA_API_KEY", None)
    PINATA_SECRET_API_KEY: Optional[str] = os.getenv("PINATA_SECRET_API_KEY", None)
    PINATA_JWT: Optional[str] = os.getenv("PINATA_JWT", None)
    IPFS_GATEWAY_URL: str = os.getenv("IPFS_GATEWAY_URL", "https://gateway.pinata.cloud/ipfs")

    # Polygon Testnet Blockchain Configuration
    POLYGON_RPC_URL: Optional[str] = os.getenv("POLYGON_RPC_URL", None)
    POLYGON_PRIVATE_KEY: Optional[str] = os.getenv("POLYGON_PRIVATE_KEY", None)
    POLYGON_CONTRACT_ADDRESS: str = os.getenv("POLYGON_CONTRACT_ADDRESS", "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7")
    POLYGON_NETWORK: str = "Polygon Amoy Testnet"

    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "echochain")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL", None)

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        if self.SUPABASE_URL:
            # If Supabase URL provided without explicit DATABASE_URL
            return self.SUPABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
