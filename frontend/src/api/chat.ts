const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResponse {
  response: string
  sources: string[]
  history: Message[]
}

export async function sendMessage(
  message: string,
  history: Message[],
  persona: 'professional' | 'casual'
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, persona }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
