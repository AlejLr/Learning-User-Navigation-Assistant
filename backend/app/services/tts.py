import re

from google.cloud import texttospeech
from google.oauth2 import service_account

from app.core.config import settings

_credentials = service_account.Credentials.from_service_account_file(str(settings.google_tts_credentials_path))
_client = texttospeech.TextToSpeechClient(credentials=_credentials)

_VOICE = texttospeech.VoiceSelectionParams(language_code="en-US", name="en-US-Neural2-F")
_AUDIO_CONFIG = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=1.25)


def _clean_for_speech(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # [label](url) -> label
    text = re.sub(r"https?://\S+", "", text)  # bare URLs aren't worth reading aloud
    text = re.sub(r"[*_`#]+", "", text)  # markdown emphasis/heading/code markers
    text = re.sub(r"^[-•]\s+", "", text, flags=re.MULTILINE)  # bullet markers
    return re.sub(r"\s+", " ", text).strip()


def synthesize(text: str) -> bytes:
    cleaned = _clean_for_speech(text)
    if not cleaned:
        return b""
    response = _client.synthesize_speech(
        input=texttospeech.SynthesisInput(text=cleaned),
        voice=_VOICE,
        audio_config=_AUDIO_CONFIG,
    )
    return response.audio_content
