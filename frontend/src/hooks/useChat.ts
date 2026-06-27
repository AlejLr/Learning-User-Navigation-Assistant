import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { streamMessage, type Message } from '../api/chat'
import { getProjectBySlug } from '../content/projects'
import { slugify } from '../utils/slugify'
import {
  createSentenceQueue,
  stopSpeaking,
  onAvatarTagChange,
  onSpeakingChange,
  onPageAction,
  onTTSFailure,
  type AvatarTag,
  type AvatarState,
  type PageAction,
} from '../services/tts'

export type Persona = 'professional' | 'casual'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const GREETING_DURATION_MS = 1000
const TOAST_DURATION_MS = 3000
const SCROLL_AFTER_NAV_DELAY_MS = 150
const HIGHLIGHT_DURATION_MS = 2000

// Canned, not LLM-generated: it's always the same message, so there's no reason to
// spend an API call regenerating it. Still tagged so it gets the full avatar/voice
// treatment, the same as a real reply, and is the one place the greeting wave actually plays.
const CANNED_GREETING =
  "{happy} Hi, I'm LUNA! {explaining} I can talk about Alejandro's projects, navigate the page, and highlight exactly what I'm referencing as I go. {chill} What would you like to know?"

/** Finds an element by slugified target id and flashes it. Retries once after a
 * short delay in case a navigation that just happened hasn't finished rendering yet. */
function highlightElement(target: string, attempt = 0): void {
  const el = document.getElementById(slugify(target))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('luna-highlight')
    setTimeout(() => el.classList.remove('luna-highlight'), HIGHLIGHT_DURATION_MS)
  } else if (attempt < 1) {
    setTimeout(() => highlightElement(target, attempt + 1), SCROLL_AFTER_NAV_DELAY_MS)
  }
}

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
  const [toast, setToast] = useState<string | null>(null)
  const ttsWarnedRef = useRef(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => onAvatarTagChange(setTagState), [])
  useEffect(() => onSpeakingChange(setSpeaking), [])

  // Only the first failure in a turn shows the toast, since a fully broken TTS
  // backend would otherwise fire this once per sentence in the reply.
  useEffect(
    () =>
      onTTSFailure(() => {
        if (ttsWarnedRef.current) return
        ttsWarnedRef.current = true
        showToast("Voice isn't available right now, showing text instead.")
      }),
    []
  )

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

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), TOAST_DURATION_MS)
  }

  function handleAction({ type, target }: PageAction) {
    if (type === 'nav') {
      const project = getProjectBySlug(target)
      showToast(`Taking you to ${project?.title ?? target}...`)
      navigate(`/projects/${target}`)
      // Without this, the new page can render at whatever scroll position the
      // previous page was left at, instead of starting at the title/KPIs.
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), SCROLL_AFTER_NAV_DELAY_MS)
      return
    }

    if (type === 'scroll') {
      showToast(`Scrolling to ${target}...`)
      const scrollNow = () => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
      if (location.pathname === '/') {
        scrollNow()
      } else {
        navigate('/')
        setTimeout(scrollNow, SCROLL_AFTER_NAV_DELAY_MS)
      }
      return
    }

    if (type === 'highlight') {
      highlightElement(target)
    }
  }

  // Page actions are emitted by tts.ts in sync with TTS playback (not text generation), so
  // they land exactly when the matching sentence is spoken. Subscribed once via a ref so the
  // listener always calls the latest closure without resubscribing on every render.
  const handleActionRef = useRef(handleAction)
  handleActionRef.current = handleAction
  useEffect(() => onPageAction(action => handleActionRef.current(action)), [])

  function appendToLastMessage(chunk: string) {
    setMessages(prev => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      updated[updated.length - 1] = { ...last, content: last.content + chunk }
      return updated
    })
  }

  /** Plays the proactive opening line in Agent mode, fully locally, no API call. */
  function greet() {
    if (loading) return
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])
    stopSpeaking()
    ttsWarnedRef.current = false

    const queue = createSentenceQueue(appendToLastMessage)
    queue.push(CANNED_GREETING)
    queue.flush()
  }

  async function send(text: string) {
    if (!text.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }])
    setLoading(true)
    stopSpeaking()
    ttsWarnedRef.current = false

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
    greet,
    voiceEnabled,
    setVoiceEnabled,
    avatarState,
    setIsTyping,
    toast,
  }
}
