import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from '@/components/header'
import { Providers } from '@/components/providers'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Aura Prime - Exam Pattern Analyzer',
  description: 'AI-powered exam paper analysis and question prediction',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <Header />
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
