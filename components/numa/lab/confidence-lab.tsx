'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ClipboardList,
  HeartHandshake,
  Play,
  Smile,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PRACTICE_LABELS, SCENARIOS, type PracticeKind, type Scenario } from '@/lib/demo-data'
import { useAppStore } from '../app-store'
import { DemoBadge, EmptyState, Field, NoticeBar, PageHeader, Panel, ProgressBar, inputClass } from '../primitives'

type Tab = PracticeKind | 'history'

const TABS: { id: Tab; label: string; icon: LucideIcon; blurb: string }[] = [
  { id: 'interview', label: 'Mock interviews', icon: Briefcase, blurb: 'Rehearse common questions until your answers feel natural.' },
  { id: 'conversation', label: 'Difficult conversations', icon: HeartHandshake, blurb: 'Roleplay tough moments in a safe space before they happen.' },
  { id: 'social', label: 'Social confidence', icon: Smile, blurb: 'Short exercises to feel more at ease around others.' },
  { id: 'history', label: 'Feedback history', icon: ClipboardList, blurb: 'Your reflections from past practice sessions.' },
]

const KIND_ICON: Record<PracticeKind, LucideIcon> = {
  interview: Briefcase,
  conversation: HeartHandshake,
  social: Smile,
}

function ConfidenceDots({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Confidence ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={cn('size-1.5 rounded-full', n <= value ? 'bg-primary shadow-[0_0_6px_rgb(155_107_255/0.8)]' : 'bg-muted')}
        />
      ))}
    </span>
  )
}

function PracticeSession({ scenario, onExit, onSaved }: { scenario: Scenario; onExit: () => void; onSaved: () => void }) {
  const { addFeedback } = useAppStore()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>(() => scenario.prompts.map(() => ''))
  const [confidence, setConfidence] = useState(3)
  const [wentWell, setWentWell] = useState('')
  const [toImprove, setToImprove] = useState('')

  const total = scenario.prompts.length
  const reflecting = step === total

  return (
    <Panel aria-label={`Practice: ${scenario.title}`} className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft aria-hidden="true" />
          All scenarios
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          {reflecting ? 'Reflection' : `Prompt ${step + 1} of ${total}`}
        </span>
      </div>

      <ProgressBar value={(step / total) * 100} label="Session progress" />

      <div className="mt-8">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-lavender">
          {PRACTICE_LABELS[scenario.kind]}
        </p>
        <h2 className="text-xl font-medium tracking-tight">{scenario.title}</h2>
      </div>

      {!reflecting ? (
        <div className="mt-6 flex flex-col gap-4">
          <blockquote className="rounded-xl border-l-2 border-primary bg-accent/40 px-4 py-3 text-pretty text-base">
            {scenario.prompts[step]}
          </blockquote>
          <Field label="Your answer" hint="Type it out, or say it aloud and jot down key points. Numa won’t analyze it yet.">
            {(id) => (
              <textarea
                id={id}
                rows={5}
                value={answers[step]}
                onChange={(e) =>
                  setAnswers((prev) => prev.map((a, i) => (i === step ? e.target.value : a)))
                }
                className={cn(inputClass, 'resize-y')}
              />
            )}
          </Field>
          <div className="flex justify-between gap-2">
            <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button size="lg" onClick={() => setStep((s) => s + 1)}>
              {step === total - 1 ? 'Reflect' : 'Next prompt'}
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="mt-6 flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            addFeedback({
              kind: scenario.kind,
              scenario: scenario.title,
              confidence,
              wentWell: wentWell.trim() || '—',
              toImprove: toImprove.trim() || '—',
            })
            onSaved()
          }}
        >
          <p className="text-sm text-muted-foreground">
            AI feedback isn’t connected yet, so this session uses self-reflection. It’s still one of the best ways to grow.
          </p>
          <fieldset>
            <legend className="mb-2 text-xs font-medium text-muted-foreground">How confident did you feel?</legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className="grid size-11 cursor-pointer place-items-center rounded-xl border border-border text-sm text-muted-foreground transition-colors hover:border-primary/40 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring"
                >
                  <input
                    type="radio"
                    name="confidence"
                    value={n}
                    checked={confidence === n}
                    onChange={() => setConfidence(n)}
                    className="sr-only"
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What went well?">
              {(id) => (
                <textarea id={id} rows={3} value={wentWell} onChange={(e) => setWentWell(e.target.value)} className={cn(inputClass, 'resize-none')} />
              )}
            </Field>
            <Field label="What would you improve?">
              {(id) => (
                <textarea id={id} rows={3} value={toImprove} onChange={(e) => setToImprove(e.target.value)} className={cn(inputClass, 'resize-none')} />
              )}
            </Field>
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="ghost" size="lg" onClick={() => setStep(total - 1)}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Button>
            <Button type="submit" size="lg">
              Save to history
            </Button>
          </div>
        </form>
      )}
    </Panel>
  )
}

function ScenarioGrid({ kind, onStart }: { kind: PracticeKind; onStart: (s: Scenario) => void }) {
  const Icon = KIND_ICON[kind]
  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {SCENARIOS.filter((s) => s.kind === kind).map((s) => (
        <li key={s.id}>
          <article className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-primary/40">
            <span className="grid size-9 place-items-center rounded-lg bg-accent text-lavender transition-shadow group-hover:shadow-[0_0_14px_rgb(155_107_255/0.4)]">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-medium">{s.title}</h3>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">{s.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.prompts.length} prompts</span>
              <Button variant="secondary" onClick={() => onStart(s)} aria-label={`Start: ${s.title}`}>
                <Play aria-hidden="true" />
                Start
              </Button>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}

function FeedbackHistory() {
  const { feedback, deleteFeedback } = useAppStore()

  if (feedback.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No sessions yet"
        description="Complete a practice session and your reflections will be saved here."
      />
    )
  }

  const average = feedback.reduce((n, f) => n + f.confidence, 0) / feedback.length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <div className="rounded-2xl border border-border bg-card/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">Sessions</p>
          <p className="text-xl font-medium">{feedback.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 px-4 py-3">
          <p className="text-xs text-muted-foreground">Avg. confidence</p>
          <p className="text-xl font-medium">{average.toFixed(1)} / 5</p>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {feedback.map((f) => {
          const Icon = KIND_ICON[f.kind]
          return (
            <li key={f.id} className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-accent text-lavender">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {f.scenario}
                    {f.demo && <DemoBadge />}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {PRACTICE_LABELS[f.kind]} · {f.date}
                  </p>
                </div>
                <ConfidenceDots value={f.confidence} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteFeedback(f.id)}
                  aria-label={`Delete feedback for ${f.scenario}`}
                  className="hover:text-destructive"
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Went well</dt>
                  <dd className="mt-0.5 text-pretty">{f.wentWell}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">To improve</dt>
                  <dd className="mt-0.5 text-pretty">{f.toImprove}</dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function ConfidenceLab() {
  const [tab, setTab] = useState<Tab>('interview')
  const [session, setSession] = useState<Scenario | null>(null)
  const current = TABS.find((t) => t.id === tab)!

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Confidence Lab"
        title="Practice the moments that matter"
        description="Rehearse interviews, tough conversations, and social situations at your own pace."
      />

      <NoticeBar>
        Scenarios are practice templates. Numa’s AI roleplay and automated feedback aren’t connected yet — sessions use guided self-reflection.
      </NoticeBar>

      {session ? (
        <PracticeSession
          key={session.id}
          scenario={session}
          onExit={() => setSession(null)}
          onSaved={() => {
            setSession(null)
            setTab('history')
          }}
        />
      ) : (
        <>
          <div role="tablist" aria-label="Confidence Lab sections" className="-mx-5 mb-6 flex gap-1.5 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`tab-${id}`}
                role="tab"
                type="button"
                aria-selected={tab === id}
                aria-controls="lab-panel"
                onClick={() => setTab(id)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground aria-selected:border-primary/50 aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
          <div id="lab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            <p className="mb-5 text-sm text-muted-foreground">{current.blurb}</p>
            {tab === 'history' ? <FeedbackHistory /> : <ScenarioGrid kind={tab} onStart={setSession} />}
          </div>
        </>
      )}
    </div>
  )
}
