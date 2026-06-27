import { useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import type { ChatMessage as ChatMessageType } from '../hooks/useChat'

interface Props {
  messages: ChatMessageType[]
  loading: boolean
}

export function ChatWindow({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="chat-window">
      {messages.length === 0 && (
        <p className="chat-empty">
          Hi! I'm LUNA, Alejandro's portfolio assistant. Ask me anything about his projects or background.
        </p>
      )}
      {messages.map((msg, i) => {
        const isPendingPlaceholder = i === messages.length - 1 && msg.role === 'assistant' && msg.content === ''
        return isPendingPlaceholder ? null : <ChatMessage key={i} message={msg} />
      })}
      {loading && messages[messages.length - 1]?.content === '' && (
        <div className="message message--luna loading">LUNA is typing…</div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
