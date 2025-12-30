from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    
    chroma_dir: str = "app/db/chroma"
    chroma_collection: str = "portfolio_kb"
    
    data_dir: str = "../data"
    
settings = Settings()