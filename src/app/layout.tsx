import './globals.css'

import { Inter } from 'next/font/google'
import { ReactNode } from 'react'
import { Provider } from './provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Tools | Rocketseat',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-black`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
