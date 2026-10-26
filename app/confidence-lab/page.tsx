import type { Metadata } from 'next'
import { ConfidenceLab } from '@/components/numa/lab/confidence-lab'

export const metadata: Metadata = { title: 'Confidence Lab' }

export default function Page() {
  return <ConfidenceLab />
}
