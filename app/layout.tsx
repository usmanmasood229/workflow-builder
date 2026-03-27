import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Slide Canvas',
  description: 'HTML slide renderer on infinite canvas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>{children}</body>
    </html>
  )
}