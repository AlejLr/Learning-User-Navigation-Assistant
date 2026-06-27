interface Props {
  onSelect: (mode: 'chat' | 'agent') => void
}

export function ModeSelect({ onSelect }: Props) {
  return (
    <div className="mode-select">
      <p className="mode-select-greeting">Hi, I'm LUNA! Which mode would you prefer?</p>

      <button type="button" className="mode-select-option" onClick={() => onSelect('chat')}>
        <span className="mode-select-label">💬 Chat</span>
        <span className="mode-select-caption">Just text, read at your own pace.</span>
      </button>

      <button type="button" className="mode-select-option" onClick={() => onSelect('agent')}>
        <span className="mode-select-label">🌙 Agent</span>
        <span className="mode-select-caption">This will toggle voice, speech animations, and page navigation.</span>
      </button>
    </div>
  )
}
