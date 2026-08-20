from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    environment: str = "development"
    app_name: str = "Gauge"

    # Database
    database_url: str

    # Redis
    redis_url: str

    # JWT
    jwt_algorithm: str = "RS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7
    jwt_private_key_path: str = "./keys/private.pem"
    jwt_public_key_path: str = "./keys/public.pem"

    # Mail
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = ""
    mail_server: str = ""
    mail_port: int = 587

    # LLM providers
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""

    # Rate limiting
    rate_limit_login_per_minute: int = 5
    rate_limit_eval_runs_free_tier_per_day: int = 20

    # GitHub App
    github_app_id: str = ""
    github_app_private_key_path: str = "./keys/github-app-private-key.pem"
    github_webhook_secret: str = ""

    # Sentry
    sentry_dsn: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
