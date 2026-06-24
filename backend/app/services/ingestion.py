import json

import chromadb
from sentence_transformers import SentenceTransformer

from app.core.config import settings

embed_model: SentenceTransformer | None = None
collection: chromadb.Collection | None = None

_STUB_MARKER = "Details coming soon."


def _flatten_project(data: dict) -> str:
    parts = [data["title"], data["hero"]["description"]]
    for section in data.get("sections", []):
        parts.append(section["heading"])
        parts.append(section["body"])
    return "\n\n".join(parts)


def _flatten_about(data: dict) -> str:
    return "\n\n".join([data["heroHeadline"], data["heroDescription"], *data["aboutText"]])


def _flatten_courses(data: list) -> str:
    return "\n\n".join(f"{c['name']} ({c['badge']}): {c['detail']}" for c in data)


def _flatten_personal(data: dict) -> str:
    return "\n\n".join(f"{note['topic']}: {note['detail']}" for note in data.get("notes", []))


def ingest() -> None:
    global embed_model, collection

    embed_model = SentenceTransformer("all-MiniLM-L6-v2")

    client = chromadb.EphemeralClient()
    collection = client.get_or_create_collection(
        "luna_kb",
        metadata={"hnsw:space": "cosine"},
    )

    documents, embeddings, ids, metadatas = [], [], [], []

    for json_file in sorted(settings.projects_path.glob("*.json")):
        data = json.loads(json_file.read_text(encoding="utf-8"))
        if data.get("cardSummary") == _STUB_MARKER:
            continue  # no real content yet, nothing useful to embed

        body = _flatten_project(data)
        documents.append(body)
        embeddings.append(embed_model.encode(body).tolist())
        ids.append(json_file.stem)
        metadatas.append({"title": data.get("title", json_file.stem)})

    about_file = settings.content_path / "about.json"
    if about_file.exists():
        data = json.loads(about_file.read_text(encoding="utf-8"))
        body = _flatten_about(data)
        documents.append(body)
        embeddings.append(embed_model.encode(body).tolist())
        ids.append("about")
        metadatas.append({"title": "About Alejandro"})

    courses_file = settings.content_path / "courses.json"
    if courses_file.exists():
        data = json.loads(courses_file.read_text(encoding="utf-8"))
        if data:
            body = _flatten_courses(data)
            documents.append(body)
            embeddings.append(embed_model.encode(body).tolist())
            ids.append("courses")
            metadatas.append({"title": "Courses & Certifications"})

    personal_file = settings.private_content_path / "personal.json"
    if personal_file.exists():
        data = json.loads(personal_file.read_text(encoding="utf-8"))
        body = _flatten_personal(data)
        if body:
            documents.append(body)
            embeddings.append(embed_model.encode(body).tolist())
            ids.append("personal")
            metadatas.append({"title": "Personal context"})

    if documents:
        collection.add(documents=documents, embeddings=embeddings, ids=ids, metadatas=metadatas)

    print(f"[LUNA] Ingested {len(documents)} documents into ChromaDB.")
