from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = "tinyllama"
    course_service_url: str = "http://course-service:8001"
    port: int = 8004

    class Config:
        env_file = ".env"

settings = Settings()