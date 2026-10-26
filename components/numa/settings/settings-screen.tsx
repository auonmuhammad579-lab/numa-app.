'use client'

import { useState } from 'react'
import { Bell, Brain, Database, ShieldCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '../app-store'
import { Field, NoticeBar, PageHeader, Panel, PanelTitle, Switch, inputClass } from '../primitives'

function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  disabled,
}: {
  label: string
  confirmLabel: string
  onConfirm: () => void
  disabled?: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  if (confirming) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            onConfirm()
            setConfirming(false)
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    )
  }
  return (
    <Button variant="outline" onClick={() => setConfirming(true)} disabled={disabled}>
      {label}
    </Button>
  )
}

export function SettingsScreen() {
  const { settings, updateSettings, memories, clearMemories, clearDemoData } = useAppStore()

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-10">
      <PageHeader
        eyebrow="Settings"
        title="Make Numa yours"
        description="Manage your profile, privacy, memory, and notifications."
      />

      <NoticeBar>
        Settings apply to this browser session only. There’s no account or database connected yet.
      </NoticeBar>

      <div className="flex flex-col gap-5">
        <Panel aria-labelledby="profile-title">
          <PanelTitle id="profile-title" icon={User}>
            Profile
          </PanelTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" hint="Numa will use this to greet you.">
              {(id) => (
                <input
                  id={id}
                  value={settings.name}
                  onChange={(e) => updateSettings({ name: e.target.value })}
                  className={inputClass}
                  autoComplete="given-name"
                />
              )}
            </Field>
            <Field label="Pronouns">
              {(id) => (
                <input
                  id={id}
                  value={settings.pronouns}
                  onChange={(e) => updateSettings({ pronouns: e.target.value })}
                  className={inputClass}
                />
              )}
            </Field>
          </div>
        </Panel>

        <Panel aria-labelledby="privacy-title">
          <PanelTitle id="privacy-title" icon={ShieldCheck}>
            Privacy
          </PanelTitle>
          <div className="divide-y divide-border">
            <Switch
              label="Save conversation transcripts"
              description="Keep chat history so you can revisit past conversations."
              checked={settings.saveTranscripts}
              onChange={(v) => updateSettings({ saveTranscripts: v })}
            />
            <Switch
              label="Share anonymous usage data"
              description="Help improve Numa. Never includes message content."
              checked={settings.shareUsageData}
              onChange={(v) => updateSettings({ shareUsageData: v })}
            />
          </div>
        </Panel>

        <Panel aria-labelledby="memory-controls-title">
          <PanelTitle id="memory-controls-title" icon={Brain}>
            Memory controls
          </PanelTitle>
          <div className="divide-y divide-border">
            <Switch
              label="Let Numa use memories"
              description="When off, Numa won’t reference anything saved in Memory."
              checked={settings.memoryEnabled}
              onChange={(v) => updateSettings({ memoryEnabled: v })}
            />
            <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Delete all memories</p>
                <p className="text-xs text-muted-foreground">
                  {memories.length} {memories.length === 1 ? 'memory' : 'memories'} saved. This can’t be undone.
                </p>
              </div>
              <ConfirmButton
                label="Delete all"
                confirmLabel="Yes, delete"
                onConfirm={clearMemories}
                disabled={memories.length === 0}
              />
            </div>
          </div>
        </Panel>

        <Panel aria-labelledby="notifications-title">
          <PanelTitle id="notifications-title" icon={Bell}>
            Notifications
          </PanelTitle>
          <p className="mb-1 text-xs text-muted-foreground">
            Preferences are saved, but no notifications are sent until a delivery service is connected.
          </p>
          <div className="divide-y divide-border">
            <Switch
              label="Reminders"
              description="Get notified when a reminder is due."
              checked={settings.notifyReminders}
              onChange={(v) => updateSettings({ notifyReminders: v })}
            />
            <Switch
              label="Daily check-in"
              description="A gentle evening prompt to reflect on your day."
              checked={settings.notifyDailyCheckIn}
              onChange={(v) => updateSettings({ notifyDailyCheckIn: v })}
            />
            <Switch
              label="Goal nudges"
              description="Encouragement when a milestone has been quiet for a while."
              checked={settings.notifyGoalNudges}
              onChange={(v) => updateSettings({ notifyGoalNudges: v })}
            />
          </div>
        </Panel>

        <Panel aria-labelledby="data-title">
          <PanelTitle id="data-title" icon={Database}>
            Demo data
          </PanelTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-pretty text-sm text-muted-foreground">
              Remove all sample conversations, reminders, memories, goals, and feedback to see the empty app.
            </p>
            <ConfirmButton label="Clear demo data" confirmLabel="Clear" onConfirm={clearDemoData} />
          </div>
        </Panel>
      </div>
    </div>
  )
}
