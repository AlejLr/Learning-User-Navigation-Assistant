from app.core.config import settings
from app.services import ingestion


def retrieve(query: str) -> tuple[list[str], list[str]]:
    embedding = ingestion.embed_model.encode(query).tolist()
    results = ingestion.collection.query(
        query_embeddings=[embedding],
        n_results=settings.top_k,
    )
    documents = results["documents"][0]
    sources = [m.get("title", "") for m in results["metadatas"][0]]
    return documents, sources
