import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { Navigation } from '@/components/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: "Ravi's - Apprentissage de l'anglais cabine",
  description: "Plateforme française d'apprentissage de l'anglais pour futurs personnels navigants commerciaux.",
  keywords: ['apprentissage anglais', 'personnel cabine', 'anglais aéronautique', 'service client'],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/flaticon.svg',
        type: 'image/svg+xml',
        sizes: '16x16 32x32 64x64',
      },
    ],
    shortcut: '/flaticon.svg',
    apple: '/flaticon.svg',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          <Navigation />
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}

