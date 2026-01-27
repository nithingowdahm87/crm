from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI CRM HCP Module"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    MYSQL_HOST: str = "mysql"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "crm"
    MYSQL_USER: str = "crm_user"
    MYSQL_PASSWORD: str = "crm_password"
    MYSQL_ROOT_PASSWORD: str = "root_password"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "gemma2-9b-it"

    FRONTEND_PORT: int = 3000
    VITE_API_BASE_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"

settings = Settings()
