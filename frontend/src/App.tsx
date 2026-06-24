import { ChatWindow } from './components/ChatWindow'
import { ChatInput } from './components/ChatInput'
import { PersonaToggle } from './components/PersonaToggle'
import { useChat } from './hooks/useChat'
import './App.css'

export default function App() {
  const { messages, sources, persona, setPersona, loading, send } = useChat()

  return (
    <div className="app">
      <header className="app-header">
        <h1>LUNA</h1>
        <p>Alejandro's portfolio assistant</p>
        <PersonaToggle persona={persona} onChange={setPersona} />
      </header>

      <ChatWindow messages={messages} loading={loading} />

      {sources.length > 0 && (
        <div className="sources">
          <span>Sources: </span>
          {sources.join(' · ')}
        </div>
      )}

      <ChatInput onSend={send} disabled={loading} />
    </div>
  )
}
