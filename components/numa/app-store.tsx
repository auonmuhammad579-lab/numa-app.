'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  DEMO_CONVERSATIONS,
  DEMO_FEEDBACK,
  DEMO_GOALS,
  DEMO_MEMORIES,
  DEMO_REMINDERS,
  uid,
  todayLabel,
  type Conversation,
  type FeedbackEntry,
  type Goal,
  type Memory,
  type MemoryCategory,
  type Reminder,
  type Settings,
} from '@/lib/demo-data'

const NOT_CONNECTED_REPLY =
  'Numa’s AI isn’t connected yet — your message is saved for this session, and real replies will appear here once it is.'

type AppStore = {
  conversations: Conversation[]
  activeConversationId: string | null
  setActiveConversation: (id: string | null) => void
  startConversation: () => string
  sendMessage: (text: string) => void
  deleteConversation: (id: string) => void

  reminders: Reminder[]
  toggleReminder: (id: string) => void

  memories: Memory[]
  addMemory: (category: MemoryCategory, text: string) => void
  updateMemory: (id: string, patch: Pick<Memory, 'category' | 'text'>) => void
  deleteMemory: (id: string) => void
  clearMemories: () => void

  goals: Goal[]
  addGoal: (title: string, area: string, targetDate: string) => void
  deleteGoal: (id: string) => void
  addMilestone: (goalId: string, title: string) => void
  toggleMilestone: (goalId: string, milestoneId: string) => void
  deleteMilestone: (goalId: string, milestoneId: string) => void

  feedback: FeedbackEntry[]
  addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'date'>) => void
  deleteFeedback: (id: string) => void

  settings: Settings
  updateSettings: (patch: Partial<Settings>) => void

  clearDemoData: () => void
}

const AppStoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS)
  const [activeConversationId, setActiveConversation] = useState<string | null>(
    DEMO_CONVERSATIONS[0]?.id ?? null,
  )
  const [reminders, setReminders] = useState(DEMO_REMINDERS)
  const [memories, setMemories] = useState(DEMO_MEMORIES)
  const [goals, setGoals] = useState(DEMO_GOALS)
  const [feedback, setFeedback] = useState(DEMO_FEEDBACK)
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const startConversation = useCallback(() => {
    const id = uid('c')
    setConversations((prev) => [
      { id, title: 'New conversation', updatedAt: 'Just now', messages: [] },
      ...prev,
    ])
    setActiveConversation(id)
    return id
  }, [])

  const sendMessage = useCallback(
    (text: string) => {
      const targetId = activeConversationId
      const userMsg = { id: uid('m'), role: 'user' as const, text }
      const sysMsg = { id: uid('m'), role: 'system' as const, text: NOT_CONNECTED_REPLY }

      if (!targetId) {
        const id = uid('c')
        setConversations((prev) => [
          { id, title: text.slice(0, 48), updatedAt: 'Just now', messages: [userMsg, sysMsg] },
          ...prev,
        ])
        setActiveConversation(id)
        return
      }

      setConversations((prev) => {
        const target = prev.find((c) => c.id === targetId)
        if (!target) return prev
        const updated: Conversation = {
          ...target,
          title: target.messages.length === 0 ? text.slice(0, 48) : target.title,
          updatedAt: 'Just now',
          messages: [...target.messages, userMsg, sysMsg],
        }
        return [updated, ...prev.filter((c) => c.id !== targetId)]
      })
    },
    [activeConversationId],
  )

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveConversation((current) => (current === id ? null : current))
  }, [])

  const updateGoal = (goalId: string, fn: (g: Goal) => Goal) =>
    setGoals((prev) => prev.map((g) => (g.id === goalId ? fn(g) : g)))

  const value = useMemo<AppStore>(
    () => ({
      conversations,
      activeConversationId,
      setActiveConversation,
      startConversation,
      sendMessage,
      deleteConversation,

      reminders,
      toggleReminder: (id) =>
        setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r))),

      memories,
      addMemory: (category, text) =>
        setMemories((prev) => [{ id: uid('mem'), category, text, createdAt: todayLabel() }, ...prev]),
      updateMemory: (id, patch) =>
        setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))),
      deleteMemory: (id) => setMemories((prev) => prev.filter((m) => m.id !== id)),
      clearMemories: () => setMemories([]),

      goals,
      addGoal: (title, area, targetDate) =>
        setGoals((prev) => [{ id: uid('g'), title, area, targetDate, milestones: [] }, ...prev]),
      deleteGoal: (id) => setGoals((prev) => prev.filter((g) => g.id !== id)),
      addMilestone: (goalId, title) =>
        updateGoal(goalId, (g) => ({
          ...g,
          milestones: [...g.milestones, { id: uid('ms'), title, done: false }],
        })),
      toggleMilestone: (goalId, milestoneId) =>
        updateGoal(goalId, (g) => ({
          ...g,
          milestones: g.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m)),
        })),
      deleteMilestone: (goalId, milestoneId) =>
        updateGoal(goalId, (g) => ({
          ...g,
          milestones: g.milestones.filter((m) => m.id !== milestoneId),
        })),

      feedback,
      addFeedback: (entry) =>
        setFeedback((prev) => [{ ...entry, id: uid('f'), date: todayLabel() }, ...prev]),
      deleteFeedback: (id) => setFeedback((prev) => prev.filter((f) => f.id !== id)),

      settings,
      updateSettings: (patch) => setSettings((prev) => ({ ...prev, ...patch })),

      clearDemoData: () => {
        setConversations((prev) => prev.filter((c) => !c.demo))
        setMemories((prev) => prev.filter((m) => !m.demo))
        setGoals((prev) => prev.filter((g) => !g.demo))
        setFeedback((prev) => prev.filter((f) => !f.demo))
        setReminders([])
        setActiveConversation(null)
      },
    }),
    [
      conversations,
      activeConversationId,
      startConversation,
      sendMessage,
      deleteConversation,
      reminders,
      memories,
      goals,
      feedback,
      settings,
    ],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider')
  return ctx
}
