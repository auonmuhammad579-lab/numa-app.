'use client'

import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-lavender">
            {eyebrow}
          </p>
        )}
        <h1 className="text-balance text-2xl font-medium tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: 'section' | 'div' | 'article' }) {
  return (
    <section
      className={cn('rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm', className)}
      {...props}
    >
      {children}
    </section>
  )
}

export function PanelTitle({
  icon: Icon,
  children,
  action,
  id,
}: {
  icon?: LucideIcon
  children: React.ReactNode
  action?: React.ReactNode
  id?: string
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-2 text-sm font-medium">
        {Icon && <Icon className="size-4 text-lavender" aria-hidden="true" />}
        {children}
      </h2>
      {action}
    </div>
  )
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-lavender/25 bg-lavender/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-lavender',
        className,
      )}
    >
      Demo
    </span>
  )
}

export function NoticeBar({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 rounded-xl border border-border bg-accent/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-accent text-lavender">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-3 focus:ring-ring/25'

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  hint?: string
  children: (id: string) => React.ReactNode
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children(id)}
      {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-pretty text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className="relative mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-border bg-muted transition-colors aria-checked:border-primary/50 aria-checked:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span
          aria-hidden="true"
          className={cn(
            'size-4 rounded-full bg-foreground shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-lavender shadow-[0_0_10px_rgb(155_107_255/0.6)] transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
