import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ThemeApplier } from '@/components/ThemeApplier'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'To-Do Web App 1.0',
  description: 'Hiyerarşik görev yönetimi uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <ThemeApplier>
          <div className="absolute top-4 right-4 z-50">
            <ThemeSwitcher />
          </div>
          {children}
        </ThemeApplier>
      </body>
    </html>
  )
} 