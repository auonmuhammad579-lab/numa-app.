'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  Home,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from './app-store'

type NavItem = { label: string; short: string; href: string; icon: LucideIcon }

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', short: 'Home', href: '/', icon: Home },
  { label: 'Chat', short: 'Chat', href: '/chat', icon: MessageCircle },
  { label: 'Memory', short: 'Memory', href: '/memory', icon: Brain },
  { label: 'Confidence Lab', short: 'Lab', href: '/confidence-lab', icon: Sparkles },
  { label: 'Goals', short: 'Goals', href: '/goals', icon: Target },
  { label: 'Settings', short: 'Settings', href: '/settings', icon: Settings },
]

const MOBILE_TABS = NAV_ITEMS.filter((item) => item.href !== '/settings')

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Numa home">
      <span
        aria-hidden="true"
        className="size-7 shrink-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,#fff8_0%,transparent_30%),radial-gradient(circle,#b48cff_0%,#7a47f5_50%,#2a1280_100%)] shadow-[0_0_18px_2px_rgb(155_107_255/0.5)]"
      />
      {showText && <span className="text-base font-medium tracking-tight">Numa</span>}
    </Link>
  )
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const { settings } = useAppStore()

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-md transition-[width] duration-300 md:flex',
        collapsed ? 'w-[4.75rem]' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && <Logo />}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav aria-label="Primary" className="flex-1 px-3 py-2">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring',
                    'aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary shadow-[0_0_8px_rgb(155_107_255/0.8)]"
                    />
                  )}
                  <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                  {collapsed ? <span className="sr-only">{label}</span> : <span>{label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn('border-t border-border p-3', collapsed && 'flex justify-center')}>
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60',
            collapsed && 'justify-center',
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
            {settings.name.slice(0, 1).toUpperCase() || '?'}
          </span>
          {collapsed ? (
            <span className="sr-only">Profile: {settings.name}</span>
          ) : (
            <span className="min-w-0">
              <span className="block truncate text-sm">{settings.name || 'Your profile'}</span>
              <span className="block text-xs text-muted-foreground">Local demo profile</span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
      <Logo />
      <Link
        href="/settings"
        aria-label="Settings"
        aria-current={isActive(pathname, '/settings') ? 'page' : undefined}
        className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground"
      >
        <Settings className="size-5" aria-hidden="true" />
      </Link>
    </header>
  )
}

function MobileTabBar() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {MOBILE_TABS.map(({ short, label, href, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground transition-colors aria-[current=page]:text-lavender"
              >
                <span
                  className={cn(
                    'grid h-7 w-12 place-items-center rounded-full transition-colors',
                    active && 'bg-accent shadow-[0_0_14px_rgb(155_107_255/0.35)]',
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span aria-hidden="true">{short}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="numa-backdrop flex min-h-dvh">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex flex-1 flex-col pb-20 md:pb-0">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  )
}
