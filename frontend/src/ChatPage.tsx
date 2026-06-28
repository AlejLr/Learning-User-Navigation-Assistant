import { useEffect, useState } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { ChatInput } from './components/ChatInput'
import { PersonaToggle } from './components/PersonaToggle'
import { ModeSelect } from './components/ModeSelect'
import { AgentAvatar } from './components/AgentAvatar'
import { Toast } from './components/Toast'
import { useChat } from './hooks/useChat'
import { stopSpeaking, unlockAudio } from './services/tts'
import './App.css'
import './components/ChatWidget.css'

type Mode = 'chat' | 'agent' | null

export function ChatPage() {
  const [mode, setMode] = useState<Mode>(null)
  const { messages, persona, setPersona, loading, send, setVoiceEnabled, avatarState, setIsTyping, toast } =
    useChat()

  useEffect(() => () => stopSpeaking(), [])

  function handleSelectMode(selected: 'chat' | 'agent') {
    setMode(selected)
    setVoiceEnabled(selected === 'agent')
    if (selected === 'agent') unlockAudio()
  }

  function handleChangeMode() {
    stopSpeaking()
    setVoiceEnabled(false)
    setMode(null)
  }

  return (
    <div className="chat-theme chat-page">
      <div className="app">
        <div className="app-header">
          <h1>LUNA</h1>
          <p>Alejandro's portfolio assistant</p>
          {mode && <PersonaToggle persona={persona} onChange={setPersona} />}
          {mode && (
            <button className="chat-widget-mode-switch" onClick={handleChangeMode} aria-label="Change mode">
              &#8644;
            </button>
          )}
        </div>

        {mode === null ? (
          <ModeSelect onSelect={handleSelectMode} />
        ) : (
          <>
            {mode === 'agent' && <AgentAvatar state={avatarState} />}
            <Toast message={toast} />
            <ChatWindow messages={messages} loading={loading} />
            <ChatInput onSend={send} disabled={loading} onTypingChange={setIsTyping} />
          </>
        )}
      </div>
    </div>
  )
}
