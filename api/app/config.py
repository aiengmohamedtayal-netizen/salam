from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AMAL_", env_file=".env", extra="ignore")

    env: Literal["development", "test", "production"]
    allowed_origins: str = "http://localhost:5173"
    database_path: str = "./data/amal.sqlite3"
    max_text_length: int = Field(default=2500, ge=15, le=10000)
    rate_limit: str = "30/minute"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = ""
    frontend_url: str = "http://127.0.0.1:5173"

    @model_validator(mode="after")
    def require_https_for_production(self):
        if self.env != "production":
            return self

        frontend = urlsplit(self.frontend_url)
        if (
            frontend.scheme != "https"
            or not frontend.netloc
            or frontend.path not in ("", "/")
            or frontend.query
            or frontend.fragment
        ):
            raise ValueError("AMAL_FRONTEND_URL must be an HTTPS origin in production")

        if not self.origins:
            raise ValueError("AMAL_ALLOWED_ORIGINS must contain HTTPS origins in production")
        for origin in self.origins:
            parsed = urlsplit(origin)
            if parsed.scheme != "https" or not parsed.netloc or parsed.path or parsed.query or parsed.fragment:
                raise ValueError("AMAL_ALLOWED_ORIGINS must contain only HTTPS origins in production")

        if self.google_redirect_uri:
            redirect = urlsplit(self.google_redirect_uri)
            if redirect.scheme != "https" or not redirect.netloc:
                raise ValueError("AMAL_GOOGLE_REDIRECT_URI must use HTTPS in production")

        return self

    @property
    def google_auth_enabled(self) -> bool:
        return bool(self.google_client_id and self.google_client_secret and self.google_redirect_uri)

    @property
    def origins(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


settings = Settings()
