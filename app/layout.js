import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'SevMunchies — Crispy, Tangy, Made With Love',
  description: 'Authentic homemade namkeen & snacks. Order on WhatsApp.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
