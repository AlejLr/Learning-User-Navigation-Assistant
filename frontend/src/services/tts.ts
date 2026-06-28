const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const SENTENCE_BOUNDARY = /[.!?](?:\s|$)/
const SURPRISED_PREROLL_MS = 700

export type AvatarTag = 'explaining' | 'happy' | 'chill' | 'skeptical' | 'surprised'
export type AvatarState = AvatarTag | 'greeting' | 'curious' | 'thinking'
export type PageAction = { type: 'nav' | 'highlight' | 'scroll'; target: string }

// Matches "{tag}" optionally followed by "[action:target]", e.g. "{explaining}[highlight:the-challenge] ".
const TAG_PATTERN = /^\{(explaining|happy|chill|skeptical|surprised)\}(?:\[(nav|highlight|scroll):([^\]]+)\])?\s*/i

function extractTag(sentence: string): { tag: AvatarTag | null; action: PageAction | null; text: string } {
  const match = sentence.match(TAG_PATTERN)
  if (!match) return { tag: null, action: null, text: sentence }
  const tag = match[1].toLowerCase() as AvatarTag
  const action = match[2] ? { type: match[2].toLowerCase() as PageAction['type'], target: match[3].trim() } : null
  return { tag, action, text: sentence.slice(match[0].length) }
}

let sessionId = 0
let playQueue: Promise<void> = Promise.resolve()
let currentAudio: HTMLAudioElement | null = null

type SpeakingListener = (speaking: boolean) => void
const speakingListeners = new Set<SpeakingListener>()

function setSpeaking(speaking: boolean): void {
  speakingListeners.forEach(listener => listener(speaking))
}

/** Subscribes to speaking start/stop, e.g. to drive an avatar animation. Returns an unsubscribe function. */
export function onSpeakingChange(listener: SpeakingListener): () => void {
  speakingListeners.add(listener)
  return () => speakingListeners.delete(listener)
}

type TagListener = (tag: AvatarTag | null) => void
const tagListeners = new Set<TagListener>()

function setAvatarTag(tag: AvatarTag | null): void {
  tagListeners.forEach(listener => listener(tag))
}

/** Subscribes to the Claude-tagged avatar expression for whichever sentence is currently queued/playing. */
export function onAvatarTagChange(listener: TagListener): () => void {
  tagListeners.add(listener)
  return () => tagListeners.delete(listener)
}

type PageActionListener = (action: PageAction) => void
const pageActionListeners = new Set<PageActionListener>()

function emitPageAction(action: PageAction): void {
  pageActionListeners.forEach(listener => listener(action))
}

/** Subscribes to inline [nav:..]/[highlight:..]/[scroll:..] directives, fired exactly when their sentence starts playing. */
export function onPageAction(listener: PageActionListener): () => void {
  pageActionListeners.add(listener)
  return () => pageActionListeners.delete(listener)
}

type FailureListener = () => void
const failureListeners = new Set<FailureListener>()

function emitTTSFailure(): void {
  failureListeners.forEach(listener => listener())
}

/** Subscribes to TTS synthesis/playback failures, e.g. to show a fallback notice. */
export function onTTSFailure(listener: FailureListener): () => void {
  failureListeners.add(listener)
  return () => failureListeners.delete(listener)
}

/**
 * Mobile Safari/Chrome only allow Audio.play() when it's invoked directly
 * within a user gesture's call stack. Our real playback happens after two
 * async network hops (chat stream, then /tts), well outside that window, so
 * it gets silently blocked. Playing one silent clip synchronously inside an
 * actual click handler unlocks audio playback for the rest of the page.
 *
 * Some mobile browsers don't keep that unlock "armed" indefinitely once the
 * gesture's call stack has unwound, so this runs on every send (not just the
 * first) — it's cheap, and skipping it after message one is what let
 * playback silently die from the second message onward.
 */
export function unlockAudio(): void {
  const silence = new Audio(
    'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
  )
  silence.play().catch(() => {})
}

export function stopSpeaking(): void {
  sessionId += 1
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
  playQueue = Promise.resolve()
  setSpeaking(false)
  setAvatarTag(null)
}

async function fetchAudioUrl(text: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return null
    const blob = await res.blob()
    return blob.size > 0 ? URL.createObjectURL(blob) : null
  } catch {
    return null
  }
}

function playUrl(url: string, mySession: number): Promise<void> {
  return new Promise(resolve => {
    if (mySession !== sessionId) {
      URL.revokeObjectURL(url)
      resolve()
      return
    }
    const audio = new Audio(url)
    currentAudio = audio
    const finish = () => {
      URL.revokeObjectURL(url)
      if (currentAudio === audio) {
        currentAudio = null
        setSpeaking(false)
      }
      resolve()
    }
    audio.onended = finish
    audio.onerror = finish
    audio.play().then(() => setSpeaking(true)).catch(finish)
  })
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function speakSentence(text: string, tag: AvatarTag | null, action: PageAction | null, mySession: number): void {
  playQueue = playQueue.then(async () => {
    if (mySession !== sessionId) return
    setAvatarTag(tag)
    // Fired in this same step, not when the tag was parsed, so it lands exactly
    // as this sentence's audio starts rather than racing ahead of the voice.
    if (action) emitPageAction(action)
    // Give the surprised reaction a beat to register before the voice catches up.
    if (tag === 'surprised') await wait(SURPRISED_PREROLL_MS)
    if (mySession !== sessionId || !text.trim()) return
    const url = await fetchAudioUrl(text)
    if (mySession !== sessionId) return
    if (!url) {
      emitTTSFailure()
      return
    }
    await playUrl(url, mySession)
  })
}

/**
 * Buffers streamed tokens and, as each completed sentence is found, strips
 * its leading {tag}[action:target] (driving the avatar expression and any
 * page action) and sends the cleaned text to the backend TTS endpoint, so
 * LUNA starts talking well before the full reply has streamed in. onSentence
 * reports the cleaned, tag-free text back to the caller so it can be shown
 * in the transcript without the tags.
 */
export function createSentenceQueue(onSentence?: (text: string) => void) {
  const mySession = sessionId
  let buffer = ''

  function emit(rawSentence: string): void {
    const { tag, action, text } = extractTag(rawSentence)
    if (text) onSentence?.(text + ' ')
    speakSentence(text, tag, action, mySession)
  }

  function push(token: string): void {
    buffer += token
    let match = buffer.match(SENTENCE_BOUNDARY)
    while (match && match.index !== undefined) {
      const idx = match.index + 1
      const sentence = buffer.slice(0, idx).trim()
      buffer = buffer.slice(idx)
      if (sentence) emit(sentence)
      match = buffer.match(SENTENCE_BOUNDARY)
    }
  }

  function flush(): void {
    const sentence = buffer.trim()
    buffer = ''
    if (sentence) emit(sentence)
    // Once everything queued for this turn has finished playing, fall back to idle.
    playQueue = playQueue.then(() => {
      if (mySession === sessionId) setAvatarTag(null)
    })
  }

  return { push, flush }
}
