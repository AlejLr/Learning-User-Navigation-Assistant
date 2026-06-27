import { useRef, useState, type KeyboardEvent } from 'react'

const TYPING_IDLE_MS = 1500

interface Props {
  onSend: (text: string) => void
  disabled: boolean
  onTypingChange?: (typing: boolean) => void
}

export function ChatInput({ onSend, disabled, onTypingChange }: Props) {
  const [value, setValue] = useState('')
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(text: string) {
    setValue(text)
    if (idleTimer.current) clearTimeout(idleTimer.current)

    if (text.trim().length > 0) {
      onTypingChange?.(true)
      // Revert to the default face if typing pauses without sending, instead of staying "curious" forever.
      idleTimer.current = setTimeout(() => onTypingChange?.(false), TYPING_IDLE_MS)
    } else {
      onTypingChange?.(false)
    }
  }

  function handleSend() {
    if (!value.trim()) return
    if (idleTimer.current) clearTimeout(idleTimer.current)
    onSend(value)
    setValue('')
    onTypingChange?.(false)
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-input">
      <textarea
        value={value}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ask about Alejandro's projects..."
        disabled={disabled}
        rows={2}
      />
      <button onClick={handleSend} disabled={disabled || !value.trim()}>
        Send
      </button>
    </div>
  )
}
