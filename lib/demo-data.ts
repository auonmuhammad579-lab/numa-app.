export type ChatMessage = { id: string; role: 'user' | 'numa' | 'system'; text: string }

export type Conversation = {
  id: string
  title: string
  updatedAt: string
  messages: ChatMessage[]
  demo?: boolean
}

export type Reminder = { id: string; title: string; when: string; done: boolean }

export type MemoryCategory = 'About me' | 'Preferences' | 'People' | 'Work' | 'Health'

export type Memory = {
  id: string
  category: MemoryCategory
  text: string
  createdAt: string
  demo?: boolean
}

export type Milestone = { id: string; title: string; done: boolean }

export type Goal = {
  id: string
  title: string
  area: string
  targetDate: string
  milestones: Milestone[]
  demo?: boolean
}

export type PracticeKind = 'interview' | 'conversation' | 'social'

export type FeedbackEntry = {
  id: string
  kind: PracticeKind
  scenario: string
  date: string
  confidence: number
  wentWell: string
  toImprove: string
  demo?: boolean
}

export type Settings = {
  name: string
  pronouns: string
  memoryEnabled: boolean
  shareUsageData: boolean
  saveTranscripts: boolean
  notifyReminders: boolean
  notifyDailyCheckIn: boolean
  notifyGoalNudges: boolean
}

export const MEMORY_CATEGORIES: MemoryCategory[] = [
  'About me',
  'Preferences',
  'People',
  'Work',
  'Health',
]

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'c-1',
    title: 'Preparing for Thursday’s interview',
    updatedAt: 'Today, 9:14 AM',
    demo: true,
    messages: [
      { id: 'm1', role: 'user', text: 'I have a product design interview on Thursday and I’m nervous.' },
      {
        id: 'm2',
        role: 'numa',
        text: 'That’s completely understandable. Want to walk through the portfolio story you plan to tell first?',
      },
      { id: 'm3', role: 'user', text: 'Yes — I’m not sure which project to lead with.' },
    ],
  },
  {
    id: 'c-2',
    title: 'Winding down after a long week',
    updatedAt: 'Yesterday',
    demo: true,
    messages: [
      { id: 'm1', role: 'user', text: 'This week was a lot. I can’t switch off.' },
      {
        id: 'm2',
        role: 'numa',
        text: 'Let’s slow things down. What’s one thing still on your mind that we can set aside together?',
      },
    ],
  },
  {
    id: 'c-3',
    title: 'Planning mom’s birthday',
    updatedAt: 'Mon',
    demo: true,
    messages: [
      { id: 'm1', role: 'user', text: 'Mom’s birthday is next month. Gift ideas?' },
      {
        id: 'm2',
        role: 'numa',
        text: 'You mentioned she loves gardening — a ceramic planter set or a botanical workshop could be lovely.',
      },
    ],
  },
]

export const DEMO_REMINDERS: Reminder[] = [
  { id: 'r-1', title: 'Review portfolio case study', when: 'Today · 6:00 PM', done: false },
  { id: 'r-2', title: 'Evening breathing exercise', when: 'Today · 9:30 PM', done: false },
  { id: 'r-3', title: 'Call Mom', when: 'Sat · 11:00 AM', done: false },
]

export const DEMO_MEMORIES: Memory[] = [
  { id: 'mem-1', category: 'About me', text: 'Works as a product designer and is interviewing for senior roles.', createdAt: 'Oct 20', demo: true },
  { id: 'mem-2', category: 'Preferences', text: 'Prefers short, direct answers in the morning.', createdAt: 'Oct 18', demo: true },
  { id: 'mem-3', category: 'People', text: 'Mom loves gardening and blue ceramics.', createdAt: 'Oct 12', demo: true },
  { id: 'mem-4', category: 'Health', text: 'Trying to be in bed by 11 PM on weeknights.', createdAt: 'Oct 9', demo: true },
]

export const DEMO_GOALS: Goal[] = [
  {
    id: 'g-1',
    title: 'Land a senior product design role',
    area: 'Career',
    targetDate: 'Dec 15',
    demo: true,
    milestones: [
      { id: 'g1-1', title: 'Refresh portfolio with two case studies', done: true },
      { id: 'g1-2', title: 'Complete 5 mock interviews', done: true },
      { id: 'g1-3', title: 'Apply to 10 companies', done: false },
      { id: 'g1-4', title: 'Prepare salary negotiation notes', done: false },
    ],
  },
  {
    id: 'g-2',
    title: 'Build a calmer evening routine',
    area: 'Wellbeing',
    targetDate: 'Nov 30',
    demo: true,
    milestones: [
      { id: 'g2-1', title: 'No screens after 10:30 PM for a week', done: true },
      { id: 'g2-2', title: 'Try three breathing techniques', done: false },
      { id: 'g2-3', title: 'Journal four nights a week', done: false },
    ],
  },
]

export const DEMO_FEEDBACK: FeedbackEntry[] = [
  {
    id: 'f-1',
    kind: 'interview',
    scenario: 'Tell me about yourself',
    date: 'Oct 24',
    confidence: 3,
    wentWell: 'Clear opening, good energy.',
    toImprove: 'Rambled when talking about my first job.',
    demo: true,
  },
  {
    id: 'f-2',
    kind: 'conversation',
    scenario: 'Asking for a raise',
    date: 'Oct 21',
    confidence: 2,
    wentWell: 'Stated my ask out loud.',
    toImprove: 'Back up the ask with specific wins.',
    demo: true,
  },
]

export const DEFAULT_SETTINGS: Settings = {
  name: 'Alex',
  pronouns: 'they/them',
  memoryEnabled: true,
  shareUsageData: false,
  saveTranscripts: true,
  notifyReminders: true,
  notifyDailyCheckIn: false,
  notifyGoalNudges: true,
}

export type Scenario = {
  id: string
  kind: PracticeKind
  title: string
  description: string
  prompts: string[]
}

export const SCENARIOS: Scenario[] = [
  {
    id: 's-int-1',
    kind: 'interview',
    title: 'Tell me about yourself',
    description: 'The classic opener. Practice a crisp two-minute story.',
    prompts: [
      'Walk me through your background in under two minutes.',
      'What are you looking for in your next role?',
      'Why does this company interest you?',
    ],
  },
  {
    id: 's-int-2',
    kind: 'interview',
    title: 'Behavioral: conflict at work',
    description: 'Use the STAR method to describe a disagreement.',
    prompts: [
      'Tell me about a time you disagreed with a teammate.',
      'What did you do to resolve it?',
      'What would you do differently now?',
    ],
  },
  {
    id: 's-int-3',
    kind: 'interview',
    title: 'Strengths & weaknesses',
    description: 'Honest, specific, and growth-oriented answers.',
    prompts: [
      'What is your greatest professional strength?',
      'What is one area you are actively improving?',
      'How do your colleagues describe you?',
    ],
  },
  {
    id: 's-con-1',
    kind: 'conversation',
    title: 'Asking for a raise',
    description: 'Make a clear, evidence-backed request to your manager.',
    prompts: [
      'Open the conversation and state what you want to discuss.',
      'Your manager says the budget is tight. How do you respond?',
      'Close the conversation with a clear next step.',
    ],
  },
  {
    id: 's-con-2',
    kind: 'conversation',
    title: 'Setting a boundary with a friend',
    description: 'Say no kindly without over-explaining.',
    prompts: [
      'Your friend asks for another last-minute favor. What do you say?',
      'They seem hurt. How do you acknowledge that?',
      'How do you reaffirm the friendship?',
    ],
  },
  {
    id: 's-con-3',
    kind: 'conversation',
    title: 'Giving tough feedback',
    description: 'Deliver honest feedback that stays constructive.',
    prompts: [
      'Describe the specific behavior you observed.',
      'Explain the impact it had.',
      'Ask how you can support them going forward.',
    ],
  },
  {
    id: 's-soc-1',
    kind: 'social',
    title: 'Starting a conversation',
    description: 'Open naturally with someone new at an event.',
    prompts: [
      'Write an opener you could use at a networking event.',
      'Ask a follow-up question that goes beyond small talk.',
      'Wrap up gracefully and suggest staying in touch.',
    ],
  },
  {
    id: 's-soc-2',
    kind: 'social',
    title: 'Speaking up in a meeting',
    description: 'Share an idea clearly when the room is busy.',
    prompts: [
      'How do you enter the discussion politely?',
      'Summarize your idea in one sentence.',
      'Someone interrupts you. How do you continue?',
    ],
  },
  {
    id: 's-soc-3',
    kind: 'social',
    title: 'Accepting a compliment',
    description: 'Receive praise without deflecting.',
    prompts: [
      'A colleague praises your presentation. Respond.',
      'Now try it without minimizing your effort.',
      'Reflect: how did that feel?',
    ],
  },
]

export const PRACTICE_LABELS: Record<PracticeKind, string> = {
  interview: 'Mock interview',
  conversation: 'Difficult conversation',
  social: 'Social confidence',
}

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
