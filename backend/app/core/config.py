from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str
    claude_model: str = "claude-haiku-4-5-20251001"
    top_k: int = 3
    knowledge_base_path: Path = Path(__file__).parents[3] / "knowledge_base"

    model_config = {"env_file": str(Path(__file__).parents[3] / ".env")}


settings = Settings()
