'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Brain, Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MEMORY_CATEGORIES, type Memory, type MemoryCategory } from '@/lib/demo-data'
import { useAppStore } from '../app-store'
import { DemoBadge, EmptyState, Field, NoticeBar, PageHeader, Panel, inputClass } from '../primitives'

type Filter = MemoryCategory | 'All'

function MemoryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<Memory, 'category' | 'text'>
  submitLabel: string
  onSubmit: (category: MemoryCategory, text: string) => void
  onCancel?: () => void
}) {
  const [category, setCategory] = useState<MemoryCategory>(initial?.category ?? 'About me')
  const [text, setText] = useState(initial?.text ?? '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const value = text.trim()
        if (!value) return
        onSubmit(category, value)
        if (!initial) setText('')
      }}
      className="flex flex-col gap-3"
    >
      <Field label="What should Numa remember?">
        {(id) => (
          <textarea
            id={id}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. I prefer gentle reminders rather than strict deadlines."
            className={cn(inputClass, 'resize-none')}
            maxLength={280}
          />
        )}
      </Field>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Category">
          {(id) => (
            <select
              id={id}
              value={category}
              onChange={(e) => setCategory(e.target.value as MemoryCategory)}
              className={cn(inputClass, 'w-auto min-w-40')}
            >
              {MEMORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="ml-auto flex gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
              <X aria-hidden="true" />
              Cancel
            </Button>
          )}
          <Button type="submit" size="lg" disabled={!text.trim()}>
            {initial ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

function MemoryCard({ memory }: { memory: Memory }) {
  const { updateMemory, deleteMemory } = useAppStore()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)

  if (editing) {
    return (
      <li className="rounded-2xl border border-primary/40 bg-card p-4">
        <MemoryForm
          initial={memory}
          submitLabel="Save"
          onSubmit={(category, text) => {
            updateMemory(memory.id, { category, text })
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
          {memory.category}
        </span>
        {memory.demo && <DemoBadge />}
        <span className="ml-auto text-xs text-muted-foreground">{memory.createdAt}</span>
      </div>
      <p className="text-pretty text-sm leading-relaxed">{memory.text}</p>
      <div className="mt-auto flex items-center justify-end gap-1">
        {confirming ? (
          <>
            <span className="mr-auto text-xs text-muted-foreground">Delete this memory?</span>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
              Keep
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteMemory(memory.id)}>
              Delete
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Pencil aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(true)}
              className="hover:text-destructive"
            >
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
          </>
        )}
      </div>
    </li>
  )
}

export function MemoryScreen() {
  const { memories, addMemory, settings } = useAppStore()
  const [filter, setFilter] = useState<Filter>('All')
  const [query, setQuery] = useState('')

  const visible = memories.filter(
    (m) =>
      (filter === 'All' || m.category === filter) &&
      m.text.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Memory"
        title="What Numa knows about you"
        description="Memories help Numa personalize conversations. You’re always in control — view, edit, or delete anything."
      />

      <NoticeBar>
        Memories are stored in this browser session only and reset on reload. Nothing is sent to a server yet.
      </NoticeBar>

      {!settings.memoryEnabled && (
        <p className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          Memory is paused. Numa won’t use these memories until you turn it back on in{' '}
          <Link href="/settings" className="underline underline-offset-2">
            Settings
          </Link>
          .
        </p>
      )}

      <Panel aria-label="Add a memory" className="mb-8">
        <MemoryForm submitLabel="Add memory" onSubmit={addMemory} />
      </Panel>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          {(['All', ...MEMORY_CATEGORIES] as Filter[]).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(c)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground aria-pressed:border-primary/50 aria-pressed:bg-accent aria-pressed:text-accent-foreground"
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="memory-search" className="sr-only">
            Search memories
          </label>
          <input
            id="memory-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories"
            className={cn(inputClass, 'pl-9')}
          />
        </div>
      </div>

      {memories.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No memories yet"
          description="Add something you’d like Numa to remember, like your preferences or important people."
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={Search} title="No matches" description="Try a different category or search term." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </ul>
      )}
    </div>
  )
}
