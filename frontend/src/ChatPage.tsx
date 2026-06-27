import { ChatWindow } from './components/ChatWindow'
import { ChatInput } from './components/ChatInput'
import { PersonaToggle } from './components/PersonaToggle'
import { VoiceToggle } from './components/VoiceToggle'
import { useChat } from './hooks/useChat'
import './App.css'

export function ChatPage() {
  const { messages, sources, persona, setPersona, loading, send, voiceEnabled, setVoiceEnabled } = useChat()

  return (
    <div className="chat-theme chat-page">
      <div className="app">
        <div className="app-header">
          <h1>LUNA</h1>
          <p>Alejandro's portfolio assistant</p>
          <PersonaToggle persona={persona} onChange={setPersona} />
          <VoiceToggle enabled={voiceEnabled} onChange={setVoiceEnabled} />
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
    </div>
  )
}
