'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Keyboard } from 'lucide-react'
import { VoiceOrb, ORB_LABELS, type OrbState } from './voice-orb'
import { StatePreview } from './state-preview'

const switchClass =
  'inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'

type VoicePanelProps = {
  title?: string
  subtitle?: string
  orbSize?: string
  textHref?: string
  onSwitchToText?: () => void
  showStatePreview?: boolean
}

export function VoicePanel({
  title,
  subtitle,
  orbSize = 'clamp(11rem, 36vw, 15rem)',
  textHref,
  onSwitchToText,
  showStatePreview = true,
}: VoicePanelProps) {
  const [orbState, setOrbState] = useState<OrbState>('idle')

  const switchContent = (
    <>
      <Keyboard className="size-4" aria-hidden="true" />
      Switch to text
    </>
  )

  return (
    <div className="flex flex-col items-center gap-8">
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h1 className="text-balance text-3xl font-medium tracking-tight md:text-4xl">{title}</h1>
          )}
          {subtitle && (
            <p className="mt-2 text-pretty text-sm text-muted-foreground md:text-base">{subtitle}</p>
          )}
        </div>
      )}

      <VoiceOrb
        state={orbState}
        onActivate={() => setOrbState((s) => (s === 'idle' ? 'listening' : 'idle'))}
        size={orbSize}
      />

      <div className="flex flex-col items-center gap-3">
        <p
          aria-live="polite"
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-lavender"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_2px_rgb(155_107_255/0.7)]"
          />
          {ORB_LABELS[orbState]}
        </p>
        {orbState !== 'idle' && (
          <p className="max-w-xs text-balance text-center text-xs text-muted-foreground">
            Visual preview only — voice isn’t connected to a backend yet, so no audio is recorded.
          </p>
        )}
      </div>

      {showStatePreview && <StatePreview value={orbState} onChange={setOrbState} />}

      {textHref ? (
        <Link href={textHref} className={switchClass}>
          {switchContent}
        </Link>
      ) : onSwitchToText ? (
        <button type="button" onClick={onSwitchToText} className={switchClass}>
          {switchContent}
        </button>
      ) : null}
    </div>
  )
}
