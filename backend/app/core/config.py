from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI CRM HCP Module"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        # Add your production frontend URL here
        # "https://yourdomain.com",
        # "https://www.yourdomain.com",
    ]

    MYSQL_HOST: str = "mysql"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "crm"
    MYSQL_USER: str = "crm_user"
    MYSQL_PASSWORD: str = "crm_password"
    MYSQL_ROOT_PASSWORD: str = "root_password"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "gemma2-9b-it"

    VITE_API_BASE_URL: str = "http://task-backend-1:8000"  # Container service name for production

    class Config:
        env_file = ".env"

settings = Settings()
