import ReactMarkdown from 'react-markdown'
import type { ChatMessage as ChatMessageType } from '../hooks/useChat'

interface Props {
  message: ChatMessageType
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user'
  return (
    <div className={`message ${isUser ? 'message--user' : 'message--luna'}`}>
      {isUser ? (
        <p>{message.content}</p>
      ) : (
        <ReactMarkdown>{message.content}</ReactMarkdown>
      )}
    </div>
  )
}
