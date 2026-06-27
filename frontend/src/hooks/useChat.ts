import { useEffect, useRef, useState } from 'react'
import { streamMessage, type Message } from '../api/chat'
import {
  createSentenceQueue,
  stopSpeaking,
  onAvatarTagChange,
  onSpeakingChange,
  type AvatarTag,
  type AvatarState,
} from '../services/tts'

export type Persona = 'professional' | 'casual'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GREETING_DURATION_MS = 1000

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [history, setHistory] = useState<Message[]>([])
  const [sources, setSources] = useState<string[]>([])
  const [persona, setPersona] = useState<Persona>('professional')
  const [loading, setLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabledState] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [tagState, setTagState] = useState<AvatarTag | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [greetingActive, setGreetingActive] = useState(false)
  const hasGreetedRef = useRef(false)

  useEffect(() => onAvatarTagChange(setTagState), [])
  useEffect(() => onSpeakingChange(setSpeaking), [])

  // The very first sentence LUNA ever speaks in agent mode gets a one-time greeting beat.
  // This must fire exactly once and run its timer to completion: tagState changes again
  // within milliseconds (next sentence's tag), so any cleanup tied to tagState would cancel
  // the timeout before it ever fires, leaving greetingActive stuck true forever.
  useEffect(() => {
    if (voiceEnabled && tagState && !hasGreetedRef.current) {
      hasGreetedRef.current = true
      setGreetingActive(true)
      setTimeout(() => setGreetingActive(false), GREETING_DURATION_MS)
    }
  }, [tagState, voiceEnabled])

  const avatarState: AvatarState = greetingActive
    ? 'greeting'
    : loading && !tagState
      ? 'thinking'
      : !speaking && isTyping
        ? 'curious'
        : tagState ?? 'happy'

  function setVoiceEnabled(value: boolean) {
    setVoiceEnabledState(value)
    if (!value) stopSpeaking()
  }

  async function send(text: string) {
    if (!text.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setLoading(true)
    stopSpeaking()

    function appendToLastMessage(chunk: string) {
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        updated[updated.length - 1] = { ...last, content: last.content + chunk }
        return updated
      })
    }

    // In voice mode, sentences arrive tagged ({explaining} ...); buffer per-sentence so
    // the tag can be stripped before it ever reaches the transcript or the TTS request.
    const queue = voiceEnabled ? createSentenceQueue(appendToLastMessage) : null

    try {
      const { sources: newSources, history: newHistory } = await streamMessage(
        text,
        history,
        persona,
        voiceEnabled,
        token => {
          if (queue) queue.push(token)
          else appendToLastMessage(token)
        }
      )
      queue?.flush()
      setHistory(newHistory)
      setSources(newSources)
    } finally {
      setLoading(false)
    }
  }

  return {
    messages,
    sources,
    persona,
    setPersona,
    loading,
    send,
    voiceEnabled,
    setVoiceEnabled,
    avatarState,
    setIsTyping,
  }
}
