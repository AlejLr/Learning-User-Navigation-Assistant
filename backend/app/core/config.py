from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str
    claude_model: str = "claude-haiku-4-5-20251001"
    top_k: int = 3
    content_path: Path = Path(__file__).parents[3] / "frontend" / "src" / "content"

    model_config = {"env_file": str(Path(__file__).parents[3] / ".env")}

    @property
    def projects_path(self) -> Path:
        return self.content_path / "projects"


settings = Settings()
