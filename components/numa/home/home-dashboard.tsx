'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bell,
  Brain,
  Check,
  MessageCircle,
  MessagesSquare,
  Plus,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '../app-store'
import { VoicePanel } from '../voice-panel'
import { DemoBadge, EmptyState, Panel, PanelTitle } from '../primitives'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

type QuickAction = { label: string; description: string; href: string; icon: LucideIcon }

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Start a chat', description: 'Type to Numa', href: '/chat', icon: MessageCircle },
  { label: 'Practice an interview', description: 'Confidence Lab', href: '/confidence-lab', icon: Sparkles },
  { label: 'Add a memory', description: 'Teach Numa about you', href: '/memory', icon: Brain },
  { label: 'Review goals', description: 'Track progress', href: '/goals', icon: Target },
]

function QuickActions() {
  return (
    <Panel aria-labelledby="quick-actions-title">
      <PanelTitle id="quick-actions-title" icon={Sparkles}>
        Quick actions
      </PanelTitle>
      <ul className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map(({ label, description, href, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-background/40 p-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-lavender transition-shadow group-hover:shadow-[0_0_14px_rgb(155_107_255/0.4)]">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function RecentConversations() {
  const router = useRouter()
  const { conversations, setActiveConversation, startConversation } = useAppStore()
  const recent = conversations.slice(0, 4)

  return (
    <Panel aria-labelledby="recent-title">
      <PanelTitle
        id="recent-title"
        icon={MessagesSquare}
        action={
          <Link href="/chat" className="text-xs text-muted-foreground hover:text-foreground">
            View all
          </Link>
        }
      >
        Recent conversations
      </PanelTitle>
      {recent.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations yet"
          description="Your chats with Numa will show up here."
          action={
            <button
              type="button"
              onClick={() => {
                startConversation()
                router.push('/chat')
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Start one
            </button>
          }
        />
      ) : (
        <ul className="-mx-2 flex flex-col">
          {recent.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveConversation(c.id)
                  router.push('/chat')
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-lavender">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm">{c.title}</span>
                    {c.demo && <DemoBadge />}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c.messages.at(-1)?.text ?? 'No messages yet'}
                  </span>
                </span>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {c.updatedAt}
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

function UpcomingReminders() {
  const { reminders, toggleReminder } = useAppStore()

  return (
    <Panel aria-labelledby="reminders-title">
      <PanelTitle id="reminders-title" icon={Bell} action={reminders.length > 0 && <DemoBadge />}>
        Upcoming reminders
      </PanelTitle>
      {reminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing scheduled"
          description="Reminders will appear here once scheduling is connected."
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {reminders.map((r) => (
            <li key={r.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
                <input
                  type="checkbox"
                  checked={r.done}
                  onChange={() => toggleReminder(r.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className="grid size-5 shrink-0 place-items-center rounded-full border border-input text-primary-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary"
                >
                  {r.done && <Check className="size-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-sm', r.done && 'text-muted-foreground line-through')}>
                    {r.title}
                  </span>
                  <span className="block text-xs text-muted-foreground">{r.when}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
        Sample reminders — notifications aren’t connected yet, so nothing will alert you.
      </p>
    </Panel>
  )
}

export function HomeDashboard() {
  const { settings } = useAppStore()
  const name = settings.name.trim()

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Panel
          aria-label="Talk to Numa"
          className="relative flex flex-col items-center justify-center overflow-hidden bg-card/30 px-5 py-12 lg:row-span-2 lg:py-16"
        >
          {/* Ambient aura behind the orb */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_22rem_at_50%_42%,rgb(139_92_246/0.18),transparent_60%),radial-gradient(20rem_14rem_at_60%_30%,rgb(217_70_239/0.08),transparent_65%),radial-gradient(18rem_18rem_at_40%_70%,rgb(59_130_246/0.07),transparent_65%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-px rounded-2xl border border-lavender/10 bg-gradient-to-b from-white/[0.02] to-transparent"
          />
          <p className="relative mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-lavender">
            {greeting()}
            {name ? `, ${name}` : ''}
          </p>
          <div className="relative">
            <VoicePanel
              title="Hi, I’m Numa."
              subtitle="Your calm, thoughtful companion. Speak whenever you’re ready."
              orbSize="clamp(11rem, 34vw, 16rem)"
              textHref="/chat"
            />
          </div>
        </Panel>

        <QuickActions />
        <UpcomingReminders />
      </div>

      <div className="mt-6">
        <RecentConversations />
      </div>
    </div>
  )
}
