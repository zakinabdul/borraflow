"""Application configuration"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    app_name: str = "Borraflow"
    debug: bool = False
    database_url: str = "sqlite:///./test.db"
    google_api_key: str
    groq_api_key: str
    firebase_project_id: str
    firebase_private_key_id: str
    firebase_private_key: str
    firebase_client_email: str
    firebase_client_id: str
    firebase_auth_uri: str = "https://accounts.google.com/o/oauth2/auth"
    firebase_token_uri: str = "https://oauth2.googleapis.com/token"
    firebase_auth_provider_x509_cert_url: str = "https://www.googleapis.com/oauth2/v1/certs"
    firebase_client_x509_cert_url: str
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8',
        extra='ignore'
    )


settings = Settings()