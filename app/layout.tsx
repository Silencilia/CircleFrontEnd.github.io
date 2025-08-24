import type { Metadata } from 'next'
import './globals.css'
import { ContactProvider } from '../contexts/ContactContext'

export const metadata: Metadata = {
  title: 'Circle - Personal Social Manager',
  description: 'Remember meaningful details about contacts and make informed social decisions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;1,400&family=Inter:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <ContactProvider>
          {children}
        </ContactProvider>
      </body>
    </html>
  )
}
