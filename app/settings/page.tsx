import type { Metadata } from 'next'
import { SettingsScreen } from '@/components/numa/settings/settings-screen'

export const metadata: Metadata = { title: 'Settings' }

export default function Page() {
  return <SettingsScreen />
}
