from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "YoTop10"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://redis:6379"

    # Auth
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200

    # CORS — stored as JSON string e.g. '["https://yotop10.com"]'
    CORS_ORIGINS: str = '["https://yotop10.com"]'

    # Email (Brevo)
    BREVO_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@yotop10.com"

    # MinIO
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str = "yotop10-media"
    MINIO_SECURE: bool = False
    CDN_URL: str = "https://cdn.yotop10.com"

    def get_cors_origins(self) -> list[str]:
        return json.loads(self.CORS_ORIGINS)


settings = Settings()
