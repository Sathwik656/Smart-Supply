from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    mongodb_url: str
    mongodb_db_name: str = "supply_chain"
    redis_url: str
    secret_key: str
    openweather_api_key: Optional[str] = None
    ors_api_key: Optional[str] = None
    twilio_account_sid: Optional[str] = None
    twilio_auth_token: Optional[str] = None
    twilio_from_number: Optional[str] = None
    sendgrid_api_key: Optional[str] = None
    mlflow_tracking_uri: str = "http://mlflow:5000"
    frontend_url: str = "http://localhost:3000"

    @property
    def frontend_origins(self) -> list[str]:
        origins = [origin.strip().rstrip("/") for origin in self.frontend_url.split(",") if origin.strip()]
        defaults = ["http://localhost:3000", "http://localhost:5173"]
        return list(dict.fromkeys([*origins, *defaults]))

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
