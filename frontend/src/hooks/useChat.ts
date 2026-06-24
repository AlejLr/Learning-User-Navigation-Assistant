import { useState } from 'react'
import { sendMessage, type Message } from '../api/chat'

export type Persona = 'professional' | 'casual'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [history, setHistory] = useState<Message[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [persona, setPersona] = useState<Persona>('professional')
  const [loading, setLoading] = useState(false)

  async function send(text: string) {
    if (!text.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await sendMessage(text, history, persona)
      setMessages(prev => [...prev, { role: 'assistant', content: res.response }])
      setHistory(res.history)
      setSources(res.sources)
    } finally {
      setLoading(false)
    }
  }

  return { messages, sources, persona, setPersona, loading, send }
}
