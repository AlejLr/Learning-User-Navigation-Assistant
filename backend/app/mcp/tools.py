import json
import re
from pathlib import Path

from app.core.config import settings

# Maps recognisable name variants to project content slugs (without .json)
_PROJECT_ALIASES: dict[str, str] = {
    "dsv": "sdg",
    "sdg": "sdg",
    "ev": "sdg",
    "charging": "sdg",
    "marketing": "smanalyzer",
    "social media": "smanalyzer",
    "nlp": "smanalyzer",
    "sentiment": "smanalyzer",
    "routeguesser": "routeguesser",
    "route guesser": "routeguesser",
    "flask": "routeguesser",
    "stata": "stata",
    "housing": "stata",
    "econometrics": "stata",
    "pepadb": "pepadb",
    "pepa": "pepadb",
    "sevilla": "pepadb",
    "esg": "esg",
    "ecosim": "ecosim",
    "rl": "ecosim",
    "thesis": "ecosim",
    "reinforcement": "ecosim",
    "luna": "luna",
}


def _resolve_slug(project_name: str) -> str | None:
    key = project_name.lower().strip()
    if key in _PROJECT_ALIASES:
        return _PROJECT_ALIASES[key]
    projects_path: Path = settings.projects_path
    for json_file in projects_path.glob("*.json"):
        if key in json_file.stem:
            return json_file.stem
    return None


def _slugify(text: str) -> str:
    """Mirrors the frontend's slugify() so ids match the DOM elements LUNA can target."""
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def get_project_metadata(project_name: str) -> dict:
    """
    Return structured metadata for one of Alejandro's projects, including the
    section/KPI ids LUNA can target with inline [nav:slug]/[highlight:id] tags.
    Valid names: sdg, smanalyzer, routeguesser, stata, luna, pepadb, esg, ecosim.
    """
    slug = _resolve_slug(project_name)
    if not slug:
        return {"error": f"No project found for '{project_name}'."}

    json_file = settings.projects_path / f"{slug}.json"
    if not json_file.exists():
        return {"error": f"File {slug}.json not found in project content."}

    data = json.loads(json_file.read_text(encoding="utf-8"))
    return {
        "slug": slug,
        "title": data.get("title", slug),
        "status": data.get("status", "unknown"),
        "category": data.get("category", "project"),
        "tags": data.get("tags", []),
        "summary": data.get("cardSummary", ""),
        "description": data.get("hero", {}).get("description", ""),
        "kpis": [
            {"label": k["label"], "value": k.get("value", ""), "id": _slugify(k["label"])}
            for k in data.get("hero", {}).get("kpis", [])
        ],
        "sections": [
            {"heading": s["heading"], "body": s["body"], "id": _slugify(s["heading"])}
            for s in data.get("sections", [])
        ],
    }
