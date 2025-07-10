import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { ThemeApplier } from '@/components/ThemeApplier'
import NextAuthProvider from '@/components/providers/NextAuthProvider';
// ThemeSwitcher import is no longer needed here
// import { ThemeSwitcher } from '@/components/ThemeSwitcher' 

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PLANTRİX - Hiç Sıradan Değil', // Updated title
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
        <NextAuthProvider>
          <ThemeApplier>
            {/* This absolute positioned ThemeSwitcher is removed */}
            {children}
          </ThemeApplier>
        </NextAuthProvider>
      </body>
    </html>
  )
} 