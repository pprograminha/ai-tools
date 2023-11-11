import { Toaster } from '@/components/ui/toaster'
import { VideosProvider } from '@/contexts/VideosContext'
import { ReactNode } from 'react'

export function Provider({children}: {children: ReactNode}) {
  return (
    <>
    <VideosProvider>
        {children}
        <Toaster />
    </VideosProvider>
    </>
  )
}
