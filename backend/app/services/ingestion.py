from pathlib import Path

import chromadb
import yaml
from sentence_transformers import SentenceTransformer

from app.core.config import settings

embed_model: SentenceTransformer | None = None
collection: chromadb.Collection | None = None


def _parse_markdown(content: str) -> tuple[dict, str]:
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            return yaml.safe_load(parts[1]) or {}, parts[2].strip()
    return {}, content.strip()


def ingest() -> None:
    global embed_model, collection

    embed_model = SentenceTransformer("all-MiniLM-L6-v2")

    client = chromadb.EphemeralClient()
    collection = client.get_or_create_collection(
        "luna_kb",
        metadata={"hnsw:space": "cosine"},
    )

    kb_path: Path = settings.knowledge_base_path
    documents, embeddings, ids, metadatas = [], [], [], []

    for md_file in sorted(kb_path.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        frontmatter, body = _parse_markdown(content)

        doc_id = md_file.stem
        embedding = embed_model.encode(body).tolist()

        documents.append(body)
        embeddings.append(embedding)
        ids.append(doc_id)
        metadatas.append({"title": frontmatter.get("title", doc_id)})

    if documents:
        collection.add(documents=documents, embeddings=embeddings, ids=ids, metadatas=metadatas)

    print(f"[LUNA] Ingested {len(documents)} documents into ChromaDB.")
