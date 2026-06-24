import type { Persona } from '../hooks/useChat'

interface Props {
  persona: Persona
  onChange: (p: Persona) => void
}

export function PersonaToggle({ persona, onChange }: Props) {
  return (
    <div className="persona-toggle">
      <button
        className={persona === 'professional' ? 'active' : ''}
        onClick={() => onChange('professional')}
      >
        Professional
      </button>
      <button
        className={persona === 'casual' ? 'active' : ''}
        onClick={() => onChange('casual')}
      >
        Casual
      </button>
    </div>
  )
}
