'use client'

import { useState } from 'react'
import { CalendarDays, Check, Plus, Target, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Goal } from '@/lib/demo-data'
import { useAppStore } from '../app-store'
import { DemoBadge, EmptyState, Field, NoticeBar, PageHeader, Panel, ProgressBar, inputClass } from '../primitives'

function progressOf(goal: Goal) {
  if (goal.milestones.length === 0) return 0
  return (goal.milestones.filter((m) => m.done).length / goal.milestones.length) * 100
}

function NewGoalForm({ onDone }: { onDone: () => void }) {
  const { addGoal } = useAppStore()
  const [title, setTitle] = useState('')
  const [area, setArea] = useState('Personal')
  const [targetDate, setTargetDate] = useState('')

  return (
    <Panel aria-label="New goal" className="mb-6 border-primary/40">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          const date = targetDate
            ? new Date(`${targetDate}T00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : 'No date'
          addGoal(title.trim(), area.trim() || 'Personal', date)
          onDone()
        }}
        className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]"
      >
        <Field label="Goal">
          {(id) => (
            <input
              id={id}
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Run a 10K"
              className={inputClass}
            />
          )}
        </Field>
        <Field label="Area">
          {(id) => <input id={id} value={area} onChange={(e) => setArea(e.target.value)} className={inputClass} />}
        </Field>
        <Field label="Target date">
          {(id) => (
            <input
              id={id}
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={cn(inputClass, '[color-scheme:dark]')}
            />
          )}
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-3">
          <Button type="button" variant="ghost" size="lg" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="lg" disabled={!title.trim()}>
            <Plus aria-hidden="true" />
            Create goal
          </Button>
        </div>
      </form>
    </Panel>
  )
}

function GoalCard({ goal }: { goal: Goal }) {
  const { toggleMilestone, addMilestone, deleteMilestone, deleteGoal } = useAppStore()
  const [draft, setDraft] = useState('')
  const progress = progressOf(goal)
  const done = goal.milestones.filter((m) => m.done).length

  return (
    <li>
      <Panel aria-label={goal.title} className="flex h-full flex-col">
        <div className="mb-4 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">{goal.area}</span>
              {goal.demo && <DemoBadge />}
            </div>
            <h2 className="text-pretty text-base font-medium">{goal.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Target: {goal.targetDate}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => deleteGoal(goal.id)}
            aria-label={`Delete goal: ${goal.title}`}
            className="hover:text-destructive"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <ProgressBar value={progress} label={`${goal.title} progress`} />
          <span className="shrink-0 font-mono text-xs text-lavender">{Math.round(progress)}%</span>
        </div>

        <h3 className="mb-2 text-xs text-muted-foreground">
          Milestones · {done}/{goal.milestones.length}
        </h3>
        {goal.milestones.length === 0 ? (
          <p className="mb-3 text-sm text-muted-foreground">No milestones yet — break this goal into small steps.</p>
        ) : (
          <ul className="mb-3 flex flex-col">
            {goal.milestones.map((m) => (
              <li key={m.id} className="group flex items-center gap-2">
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg py-1.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
                  <input
                    type="checkbox"
                    checked={m.done}
                    onChange={() => toggleMilestone(goal.id, m.id)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-5 shrink-0 place-items-center rounded-md border border-input text-primary-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary"
                  >
                    {m.done && <Check className="size-3" />}
                  </span>
                  <span className={cn('text-sm', m.done && 'text-muted-foreground line-through')}>{m.title}</span>
                </label>
                <button
                  type="button"
                  onClick={() => deleteMilestone(goal.id, m.id)}
                  aria-label={`Remove milestone: ${m.title}`}
                  className="grid size-6 place-items-center rounded text-muted-foreground opacity-0 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!draft.trim()) return
            addMilestone(goal.id, draft.trim())
            setDraft('')
          }}
          className="mt-auto flex gap-2 border-t border-border pt-3"
        >
          <label htmlFor={`ms-${goal.id}`} className="sr-only">
            Add milestone to {goal.title}
          </label>
          <input
            id={`ms-${goal.id}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a milestone"
            className={cn(inputClass, 'py-1.5')}
          />
          <Button type="submit" variant="secondary" size="lg" disabled={!draft.trim()} aria-label="Add milestone">
            <Plus aria-hidden="true" />
          </Button>
        </form>
      </Panel>
    </li>
  )
}

export function GoalsScreen() {
  const { goals } = useAppStore()
  const [creating, setCreating] = useState(false)

  const totalMilestones = goals.reduce((n, g) => n + g.milestones.length, 0)
  const doneMilestones = goals.reduce((n, g) => n + g.milestones.filter((m) => m.done).length, 0)
  const overall = totalMilestones ? (doneMilestones / totalMilestones) * 100 : 0

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Goals"
        title="Small steps, steady progress"
        description="Set personal goals, break them into milestones, and watch your progress grow."
        actions={
          !creating && (
            <Button size="lg" onClick={() => setCreating(true)}>
              <Plus aria-hidden="true" />
              New goal
            </Button>
          )
        }
      />

      <NoticeBar>Goals are saved for this browser session only. Numa won’t send nudges until notifications are connected.</NoticeBar>

      {goals.length > 0 && (
        <dl className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Active goals', value: goals.length },
            { label: 'Milestones done', value: `${doneMilestones}/${totalMilestones}` },
            { label: 'Overall progress', value: `${Math.round(overall)}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card/60 p-4">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 text-xl font-medium tracking-tight">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {creating && <NewGoalForm onDone={() => setCreating(false)} />}

      {goals.length === 0 ? (
        !creating && (
          <EmptyState
            icon={Target}
            title="No goals yet"
            description="Start with something meaningful — big or small."
            action={
              <Button onClick={() => setCreating(true)}>
                <Plus aria-hidden="true" />
                Create your first goal
              </Button>
            }
          />
        )
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </ul>
      )}
    </div>
  )
}
