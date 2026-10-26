'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, AudioLines, Info, MessageCircle, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/demo-data'
import { useAppStore } from '../app-store'
import { VoiceOrb } from '../voice-orb'
import { VoicePanel } from '../voice-panel'
import { DemoBadge } from '../primitives'

function ConversationList({ onSelect }: { onSelect?: () => void }) {
  const { conversations, activeConversationId, setActiveConversation, startConversation, deleteConversation } =
    useAppStore()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className="text-sm font-medium">Conversations</h2>
        <button
          type="button"
          onClick={() => {
            startConversation()
            onSelect?.()
          }}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          New
        </button>
      </div>
      {conversations.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">No conversations yet.</p>
      ) : (
        <ul className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.map((c) => {
            const active = c.id === activeConversationId
            return (
              <li key={c.id} className="group relative">
                <button
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => {
                    setActiveConversation(c.id)
                    onSelect?.()
                  }}
                  className="w-full rounded-xl px-3 py-2.5 pr-9 text-left transition-colors hover:bg-muted/50 aria-[current=true]:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm">{c.title}</span>
                    {c.demo && <DemoBadge />}
                  </span>
                  <span className="block text-xs text-muted-foreground">{c.updatedAt}</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteConversation(c.id)}
                  aria-label={`Delete conversation: ${c.title}`}
                  className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function MessageThread({ conversation }: { conversation: Conversation | undefined }) {
  const endRef = useRef<HTMLLIElement>(null)
  const count = conversation?.messages.length ?? 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [count, conversation?.id])

  if (!conversation || count === 0) {
    return (
      <div className="m-auto flex max-w-sm flex-col items-center gap-4 px-6 text-center">
        <VoiceOrb state="idle" size="4.5rem" ariaLabel="Numa" disabled className="pointer-events-none disabled:opacity-100" />
        <div>
          <p className="text-sm font-medium">Start a conversation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask anything, or tell Numa what’s on your mind. Messages stay in this browser session only.
          </p>
        </div>
      </div>
    )
  }

  return (
    <ol aria-live="polite" className="flex flex-col gap-4 px-4 py-6 md:px-8">
      {conversation.messages.map((m) => {
        if (m.role === 'system') {
          return (
            <li key={m.id} className="flex items-start gap-2 self-center rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground md:max-w-md">
              <Info className="mt-0.5 size-3.5 shrink-0 text-lavender" aria-hidden="true" />
              {m.text}
            </li>
          )
        }
        const isUser = m.role === 'user'
        return (
          <li key={m.id} className={cn('flex items-end gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
            {!isUser && (
              <span
                aria-hidden="true"
                className="mb-0.5 size-7 shrink-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#fff8_0%,transparent_30%),radial-gradient(circle,#b48cff_0%,#7a47f5_50%,#2a1280_100%)] shadow-[0_0_12px_rgb(155_107_255/0.45)]"
              />
            )}
            <div
              className={cn(
                'max-w-[78%] px-4 py-2.5 text-sm leading-relaxed',
                isUser
                  ? 'rounded-2xl rounded-br-md bg-primary text-primary-foreground'
                  : 'rounded-2xl rounded-bl-md border border-border bg-card text-card-foreground',
              )}
            >
              <span className="sr-only">{isUser ? 'You: ' : 'Numa: '}</span>
              {m.text}
            </div>
          </li>
        )
      })}
      <li ref={endRef} aria-hidden="true" />
    </ol>
  )
}

function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [draft, setDraft] = useState('')

  const send = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
      className="flex items-end gap-2 rounded-2xl border border-border bg-card/80 p-2 backdrop-blur focus-within:border-primary/50 focus-within:shadow-[0_0_24px_rgb(155_107_255/0.15)]"
    >
      <label htmlFor="numa-message" className="sr-only">
        Message Numa
      </label>
      <textarea
        id="numa-message"
        rows={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            e.preventDefault()
            send()
          }
        }}
        placeholder="Message Numa…"
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="submit"
        disabled={!draft.trim()}
        aria-label="Send message"
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowUp className="size-4" aria-hidden="true" />
      </button>
    </form>
  )
}

export function ChatScreen() {
  const { conversations, activeConversationId, sendMessage } = useAppStore()
  const [mode, setMode] = useState<'text' | 'voice'>('text')
  const [showList, setShowList] = useState(false)
  const active = conversations.find((c) => c.id === activeConversationId)

  return (
    <div className="flex h-[calc(100dvh-7.5rem)] min-h-0 md:h-dvh">
      <aside
        aria-label="Conversation history"
        className="hidden w-72 shrink-0 border-r border-border bg-card/20 lg:block"
      >
        <ConversationList />
      </aside>

      <section aria-label="Chat" className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setShowList((s) => !s)}
              aria-expanded={showList}
              aria-label="Show conversations"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:hidden"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 truncate text-base font-medium tracking-tight">
                <span className="truncate">{active?.title ?? 'Chat with Numa'}</span>
                {active?.demo && <DemoBadge />}
              </h1>
              <p className="text-xs text-muted-foreground">AI replies not connected yet</p>
            </div>
          </div>
          <div role="group" aria-label="Input mode" className="flex shrink-0 rounded-full border border-border bg-card/60 p-1">
            {(['text', 'voice'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors aria-pressed:bg-accent aria-pressed:text-accent-foreground"
              >
                {m === 'text' ? <MessageCircle className="size-3.5" aria-hidden="true" /> : <AudioLines className="size-3.5" aria-hidden="true" />}
                {m === 'text' ? 'Text' : 'Voice'}
              </button>
            ))}
          </div>
        </header>

        {showList && (
          <div className="max-h-[50%] border-b border-border bg-card/40 lg:hidden">
            <ConversationList onSelect={() => setShowList(false)} />
          </div>
        )}

        {mode === 'voice' ? (
          <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-8">
            <VoicePanel
              subtitle="Tap the orb to preview how voice will feel."
              orbSize="clamp(9rem, 36vw, 13rem)"
              onSwitchToText={() => setMode('text')}
            />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              <MessageThread conversation={active} />
            </div>
            <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-2 md:px-8 md:pb-6">
              <Composer onSend={sendMessage} />
            </div>
          </>
        )}
      </section>
    </div>
  )
}
