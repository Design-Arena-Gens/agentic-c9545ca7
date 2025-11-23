import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YouTube Clip Maker',
  description: 'Create clips from YouTube videos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
