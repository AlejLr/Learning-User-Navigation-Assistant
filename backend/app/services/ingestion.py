import json

import chromadb

from app.core.config import settings

collection: chromadb.Collection | None = None

_STUB_MARKER = "Details coming soon."


def _flatten_project(data: dict) -> str:
    parts = [data["title"], data["hero"]["description"]]
    for section in data.get("sections", []):
        parts.append(section["heading"])
        parts.append(section["body"])
    if data.get("agentNotes"):
        # Voice-only flavor notes, never rendered on the page, only ingested
        # so LUNA can speak about itself in character.
        parts.append("Voice notes (for how to talk about this project, not facts to read aloud):")
        parts.extend(data["agentNotes"])
    return "\n\n".join(parts)


def _flatten_about(data: dict) -> str:
    return "\n\n".join([data["heroHeadline"], data["heroDescription"], *data["aboutText"]])


def _flatten_courses(data: list) -> str:
    return "\n\n".join(f"{c['name']} ({c['badge']}): {c['detail']}" for c in data)


def _flatten_notes(data: dict) -> str:
    return "\n\n".join(f"{note['topic']}: {note['detail']}" for note in data.get("notes", []))


def _flatten_education(data: dict) -> str:
    entries = data.get("education", [])
    return "\n\n".join(
        f"{e['degree']} at {e['institution']} ({e['dates']}). {e.get('detail', '')}".strip()
        for e in entries
    )


def _flatten_work_experience(data: dict) -> str:
    entries = data.get("workExperience", [])
    return "\n\n".join(
        f"{e['role']} at {e['organization']} ({e['dates']}). {e.get('detail', '')}".strip()
        for e in entries
    )


def _flatten_skills(data: dict) -> str:
    skills = data.get("skills", {})
    return "\n".join(f"{category}: {', '.join(items)}" for category, items in skills.items())


def _flatten_languages(data: dict) -> str:
    languages = data.get("languages", [])
    return ", ".join(f"{lang['name']} ({lang['level']})" for lang in languages)


def _flatten_academic_highlights(data: dict) -> str:
    return "\n".join(data.get("academicHighlights", []))


def ingest() -> None:
    global collection

    client = chromadb.EphemeralClient()
    collection = client.get_or_create_collection(
        "luna_kb",
        metadata={"hnsw:space": "cosine"},
    )

    documents, ids, metadatas = [], [], []

    for json_file in sorted(settings.projects_path.glob("*.json")):
        data = json.loads(json_file.read_text(encoding="utf-8"))
        if data.get("cardSummary") == _STUB_MARKER:
            continue  # no real content yet, nothing useful to embed

        documents.append(_flatten_project(data))
        ids.append(json_file.stem)
        metadatas.append({"title": data.get("title", json_file.stem)})

    about_file = settings.content_path / "about.json"
    if about_file.exists():
        data = json.loads(about_file.read_text(encoding="utf-8"))
        documents.append(_flatten_about(data))
        ids.append("about")
        metadatas.append({"title": "About Alejandro"})

    courses_file = settings.content_path / "courses.json"
    if courses_file.exists():
        data = json.loads(courses_file.read_text(encoding="utf-8"))
        if data:
            documents.append(_flatten_courses(data))
            ids.append("courses")
            metadatas.append({"title": "Courses & Certifications"})

    extra_info_file = settings.extra_info_path / "extra_info.json"
    if extra_info_file.exists():
        data = json.loads(extra_info_file.read_text(encoding="utf-8"))

        for doc_id, title, flattener in [
            ("extra_notes", "Extra info about Alejandro", _flatten_notes),
            ("extra_education", "Education and academic background, university, degree", _flatten_education),
            ("extra_work_experience", "Work experience, employment history", _flatten_work_experience),
            ("extra_skills", "Technical skills", _flatten_skills),
            ("extra_languages", "Languages spoken", _flatten_languages),
            ("extra_highlights", "Academic highlights, grades", _flatten_academic_highlights),
        ]:
            body = flattener(data)
            if body:
                # Prefixing with the topic in plain words measurably improves
                # embedding relevance for short factual documents like these.
                documents.append(f"{title}:\n\n{body}")
                ids.append(doc_id)
                metadatas.append({"title": title})

    if documents:
        collection.add(documents=documents, ids=ids, metadatas=metadatas)

    print(f"[LUNA] Ingested {len(documents)} documents into ChromaDB.")
