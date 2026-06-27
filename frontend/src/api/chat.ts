const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResult {
  sources: string[]
  history: Message[]
}

/** Fire-and-forget request to wake a sleeping Render free-tier instance before the user finishes typing. */
export function warmUp(): void {
  fetch(`${API_URL}/health`).catch(() => {})
}

/** Streams the assistant's reply token by token via SSE, calling onToken as each arrives. */
export async function streamMessage(
  message: string,
  history: Message[],
  persona: 'professional' | 'casual',
  voiceMode: boolean,
  onToken: (text: string) => void
): Promise<ChatResult> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, persona, voice_mode: voiceMode }),
  })
  if (!res.ok || !res.body) throw new Error(`API error: ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result: ChatResult | null = null

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const raw of events) {
      const line = raw.replace(/^data: /, '').trim()
      if (!line) continue
      const event = JSON.parse(line)
      if (event.type === 'token') onToken(event.text)
      else if (event.type === 'done') result = { sources: event.sources, history: event.history }
    }
  }

  if (!result) throw new Error('Stream ended without a final event')
  return result
}
