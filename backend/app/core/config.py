"""Application configuration"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    app_name: str = "Borraflow"
    debug: bool = False
    database_url: str = "sqlite:///./test.db"
    google_api_key: str
    groq_api_key:str
    
    class Config:
        env_file = ".env"


settings = Settings()

""" previous setup(after docker run, setup it)
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    # Required fields
    APP_NAME: str
    API_V1_STR: str
    DATABASE_URL: str
    GROQ_API: str
    # Fields with defaults
    DEBUG: bool = False 

    model_config = SettingsConfigDict(
        # 1. Where to look for the file locally
        env_file=[".env", "envs/.env.prod", "envs/.env"],
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
"""