from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AMAL_", env_file=".env", extra="ignore")

    env: str = "development"
    allowed_origins: str = "http://localhost:5173"
    database_path: str = "./data/amal.sqlite3"
    max_text_length: int = Field(default=2500, ge=15, le=10000)
    rate_limit: str = "30/minute"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""
    frontend_url: str = "http://127.0.0.1:5173"

    @property
    def google_auth_enabled(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret and self.google_redirect_uri)

    @property
    def origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


settings = Settings()
