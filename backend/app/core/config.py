import os
from typing import List

class Settings:
    PROJECT_NAME: str = "VAZHI-AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vazhi.db")
    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
