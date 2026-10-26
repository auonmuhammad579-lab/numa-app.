import type { Metadata } from 'next'
import { MemoryScreen } from '@/components/numa/memory/memory-screen'

export const metadata: Metadata = { title: 'Memory' }

export default function Page() {
  return <MemoryScreen />
}
