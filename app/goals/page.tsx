import type { Metadata } from 'next'
import { GoalsScreen } from '@/components/numa/goals/goals-screen'

export const metadata: Metadata = { title: 'Goals' }

export default function Page() {
  return <GoalsScreen />
}
