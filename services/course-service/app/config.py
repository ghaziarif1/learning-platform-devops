from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://redis:6379"
    user_service_url: str = "http://user-service:8002"
    port: int = 8001

    class Config:
        env_file = ".env"

settings = Settings()