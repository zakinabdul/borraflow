"""Application configuration"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    app_name: str = "Borraflow"
    debug: bool = False
    database_url: str = "sqlite:///./test.db"
    
    class Config:
        env_file = ".env"


settings = Settings()
