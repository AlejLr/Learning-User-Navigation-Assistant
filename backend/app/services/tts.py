import re
import logging
from pathlib import Path

from google.cloud import texttospeech
from google.oauth2 import service_account

from app.core.config import settings

_logger = logging.getLogger(__name__)
_client: texttospeech.TextToSpeechClient | None = None
_RENDER_SECRET_PATH = Path("/etc/secrets/google-tts-credentials.json")

_VOICE = texttospeech.VoiceSelectionParams(language_code="en-US", name="en-US-Neural2-F")
_AUDIO_CONFIG = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=1.25)


def _clean_for_speech(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # [label](url) -> label
    text = re.sub(r"https?://\S+", "", text)  # bare URLs aren't worth reading aloud
    text = re.sub(r"[*_`#]+", "", text)  # markdown emphasis/heading/code markers
    text = re.sub(r"^[-•]\s+", "", text, flags=re.MULTILINE)  # bullet markers
    return re.sub(r"\s+", " ", text).strip()


def _get_client() -> texttospeech.TextToSpeechClient | None:
    global _client

    if _client is not None:
        return _client

    candidate_paths = [Path(settings.google_tts_credentials_path), _RENDER_SECRET_PATH]
    for credentials_path in candidate_paths:
        if credentials_path.exists():
            credentials = service_account.Credentials.from_service_account_file(str(credentials_path))
            _client = texttospeech.TextToSpeechClient(credentials=credentials)
            return _client

    _logger.warning(
        "Google TTS credentials not found at %s or %s; TTS is disabled",
        candidate_paths[0],
        candidate_paths[1],
    )
    return None


def synthesize(text: str) -> bytes:
    cleaned = _clean_for_speech(text)
    if not cleaned:
        return b""
    client = _get_client()
    if client is None:
        return b""

    response = client.synthesize_speech(
        input=texttospeech.SynthesisInput(text=cleaned),
        voice=_VOICE,
        audio_config=_AUDIO_CONFIG,
    )
    return response.audio_content
