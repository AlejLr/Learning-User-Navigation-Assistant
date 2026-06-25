import { useState } from 'react'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { PersonaToggle } from './PersonaToggle'
import { useChat } from '../hooks/useChat'
import { warmUp } from '../api/chat'
import '../App.css'
import './ChatWidget.css'

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const { messages, sources, persona, setPersona, loading, send } = useChat()

  function handleOpen() {
    setOpen(true)
    setHasOpenedOnce(true)
    warmUp()
  }

  return (
    <div className="chat-widget">
      {open ? (
        <div className="chat-theme app chat-widget-panel">
          <div className="app-header">
            <h1>LUNA</h1>
            <p>Alejandro's portfolio assistant</p>
            <PersonaToggle persona={persona} onChange={setPersona} />
            <button className="chat-widget-close" onClick={() => setOpen(false)} aria-label="Minimize chat">
              &#8722;
            </button>
          </div>

          <ChatWindow messages={messages} loading={loading} />

          {sources.length > 0 && (
            <div className="sources">
              <span>Sources: </span>
              {sources.join(' · ')}
            </div>
          )}

          <ChatInput onSend={send} disabled={loading} />
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
