import { useEffect, useState } from 'react'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { PersonaToggle } from './PersonaToggle'
import { ModeSelect } from './ModeSelect'
import { AgentAvatar } from './AgentAvatar'
import { useChat } from '../hooks/useChat'
import { warmUp } from '../api/chat'
import { stopSpeaking } from '../services/tts'
import '../App.css'
import './ChatWidget.css'

type Mode = 'chat' | 'agent' | null

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [mode, setMode] = useState<Mode>(null)
  const { messages, persona, setPersona, loading, send, setVoiceEnabled, avatarState, setIsTyping } = useChat()

  // Wake a sleeping Render free-tier instance as soon as someone lands on the
  // page, not just when they open the chat, most visitors read for a few
  // seconds first, which is free time for the backend to wake up in.
  useEffect(() => {
    warmUp()
    return () => stopSpeaking()
  }, [])

  function handleOpen() {
    setOpen(true)
    setHasOpenedOnce(true)
    warmUp()
  }

  function handleClose() {
    setOpen(false)
    stopSpeaking()
  }

  function handleSelectMode(selected: 'chat' | 'agent') {
    setMode(selected)
    setVoiceEnabled(selected === 'agent')
  }

  function handleChangeMode() {
    stopSpeaking()
    setVoiceEnabled(false)
    setMode(null)
  }

  return (
    <div className="chat-widget">
      {open ? (
        <div className="chat-theme app chat-widget-panel">
          <div className="app-header">
            <h1>LUNA</h1>
            <p>Alejandro's portfolio assistant</p>
            {mode && <PersonaToggle persona={persona} onChange={setPersona} />}
            {mode && (
              <button className="chat-widget-mode-switch" onClick={handleChangeMode} aria-label="Change mode">
                &#8644;
              </button>
            )}
            <button className="chat-widget-close" onClick={handleClose} aria-label="Minimize chat">
              &#8722;
            </button>
          </div>

          {mode === null ? (
            <ModeSelect onSelect={handleSelectMode} />
          ) : (
            <>
              {mode === 'agent' && <AgentAvatar state={avatarState} />}
              <ChatWindow messages={messages} loading={loading} />
              <ChatInput onSend={send} disabled={loading} onTypingChange={setIsTyping} />
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          className={`chat-widget-bubble${hasOpenedOnce ? '' : ' nudge'}`}
          onClick={handleOpen}
          aria-label="Open chat with LUNA"
        >
          🌙
        </button>
      )}
    </div>
  )
}
