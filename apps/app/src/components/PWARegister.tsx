'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PWARegister() {
  const router = useRouter()

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(console.error)

    // A notification was tapped while the app was open (public/sw.js): route without reload
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | null
      if (data?.type !== 'navigate' || !data.url) return
      const url = new URL(data.url, window.location.origin)
      if (url.origin !== window.location.origin) return
      router.push(`${url.pathname}${url.search}${url.hash}`)
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [router])

  return null
}
