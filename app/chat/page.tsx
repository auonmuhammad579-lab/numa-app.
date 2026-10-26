import type { Metadata } from 'next'
import { ChatScreen } from '@/components/numa/chat/chat-screen'

export const metadata: Metadata = { title: 'Chat' }

export default function Page() {
  return <ChatScreen />
}
