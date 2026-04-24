from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://redis:6379"
    course_service_url: str = "http://course-service:8001"
    port: int = 8003

    class Config:
        env_file = ".env"

settings = Settings()