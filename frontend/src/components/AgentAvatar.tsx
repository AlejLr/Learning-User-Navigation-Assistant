import { useEffect, useState } from 'react'
import { onSpeakingChange, type AvatarState } from '../services/tts'

const AVATAR_IMAGES: Record<AvatarState, string> = {
  greeting: '/assets/avatar/greeting.png',
  curious: '/assets/avatar/curious.png',
  thinking: '/assets/avatar/thinking.png',
  explaining: '/assets/avatar/explaining.png',
  happy: '/assets/avatar/happy.png',
  chill: '/assets/avatar/chill.png',
  skeptical: '/assets/avatar/skeptical.png',
  surprised: '/assets/avatar/surprised.png',
}

const FADE_MS = 150

interface Props {
  state: AvatarState
}

export function AgentAvatar({ state }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const [displayedState, setDisplayedState] = useState(state)
  const [fading, setFading] = useState(false)

  useEffect(() => onSpeakingChange(setSpeaking), [])

  // Crossfade: fade the current face out, swap the underlying image while invisible,
  // then let it fade back in, instead of an instant pop between expressions.
  useEffect(() => {
    if (state === displayedState) return
    setFading(true)
    const timer = setTimeout(() => {
      setDisplayedState(state)
      setFading(false)
    }, FADE_MS)
    return () => clearTimeout(timer)
  }, [state, displayedState])

  return (
    <div className="agent-avatar" aria-hidden="true">
      <div className="agent-avatar-face-wrap">
        <img
          className={`agent-avatar-face${fading ? ' fading' : ''}`}
          src={AVATAR_IMAGES[displayedState]}
          alt=""
        />
        {displayedState === 'explaining' && (
          <img
            className={`agent-avatar-finger${speaking ? ' speaking' : ''}`}
            src="/assets/avatar/finger.png"
            alt=""
          />
        )}
        {displayedState === 'greeting' && (
          <img className="agent-avatar-hand" src="/assets/avatar/greeting_hand.png" alt="" />
        )}
      </div>
    </div>
  )
}
