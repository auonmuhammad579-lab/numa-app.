'use client'

import { ORB_LABELS, type OrbState } from './voice-orb'

const STATES: OrbState[] = ['idle', 'listening', 'thinking', 'speaking']

export function StatePreview({
  value,
  onChange,
}: {
  value: OrbState
  onChange: (state: OrbState) => void
}) {
  return (
    <fieldset className="flex flex-col items-center gap-2">
      <legend className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
        Preview orb states
      </legend>
      <div className="flex flex-wrap justify-center gap-1 rounded-full border border-border bg-card/40 p-1">
        {STATES.map((state) => (
          <label
            key={state}
            className="cursor-pointer rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground has-[:checked]:bg-accent has-[:checked]:text-accent-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
          >
            <input
              type="radio"
              name="orb-state"
              value={state}
              checked={value === state}
              onChange={() => onChange(state)}
              className="sr-only"
            />
            {state === 'idle' ? 'Idle' : ORB_LABELS[state]}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
