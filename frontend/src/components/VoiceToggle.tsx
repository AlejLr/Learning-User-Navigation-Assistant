interface Props {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function VoiceToggle({ enabled, onChange }: Props) {
  return (
    <button
      type="button"
      className="voice-toggle"
      onClick={() => onChange(!enabled)}
      aria-label={enabled ? 'Mute LUNA' : 'Enable voice'}
      aria-pressed={enabled}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  )
}
