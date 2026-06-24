from pathlib import Path

import yaml

from app.core.config import settings

# Maps recognisable name variants to knowledge base filenames (without .md)
_PROJECT_ALIASES: dict[str, str] = {
    "dsv": "project_dsv",
    "ev": "project_dsv",
    "charging": "project_dsv",
    "pepadb": "project_pepadb",
    "pepa": "project_pepadb",
    "sevilla": "project_pepadb",
    "marketing": "project_marketing_analyzer",
    "social media": "project_marketing_analyzer",
    "nlp": "project_marketing_analyzer",
    "esg": "project_esg_analyzer",
    "ecosim": "project_ecosim",
    "rl": "project_ecosim",
    "thesis": "project_ecosim",
    "reinforcement": "project_ecosim",
    "cv": "cv",
    "background": "cv",
    "education": "cv",
    "skills": "skills",
}


def _resolve_filename(project_name: str) -> str | None:
    key = project_name.lower().strip()
    if key in _PROJECT_ALIASES:
        return _PROJECT_ALIASES[key]
    # fallback: check if key appears in any filename
    kb_path: Path = settings.knowledge_base_path
    for md_file in kb_path.glob("*.md"):
        if key in md_file.stem:
            return md_file.stem
    return None


def get_project_metadata(project_name: str) -> dict:
    """
    Return structured metadata for one of Alejandro's projects or background files.
    Valid names: dsv, pepadb, marketing, esg, ecosim, cv, skills.
    """
    filename = _resolve_filename(project_name)
    if not filename:
        return {"error": f"No knowledge base entry found for '{project_name}'."}

    kb_path: Path = settings.knowledge_base_path
    md_file = kb_path / f"{filename}.md"
    if not md_file.exists():
        return {"error": f"File {filename}.md not found in knowledge base."}

    content = md_file.read_text(encoding="utf-8")
    frontmatter, body = {}, content

    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            frontmatter = yaml.safe_load(parts[1]) or {}
            body = parts[2].strip()

    return {
        "title": frontmatter.get("title", filename),
        "category": frontmatter.get("category", "unknown"),
        "tags": frontmatter.get("tags", []),
        "content": body,
    }
