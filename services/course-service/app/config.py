from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://redis:6379"
    user_service_url: str = "http://user-service:8002"
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str
    minio_url: str
    port: int = 8001

    class Config:
        env_file = ".env"

settings = Settings()