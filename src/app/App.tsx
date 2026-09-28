import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { LoginPage } from '@/features/auth/LoginPage'
import { ChatShell } from '@/features/chat/ChatShell'
import { useNotificationPoll } from '@/features/chat/useNotificationPoll'

export function App() {
  const [hydrated, setHydrated] = useState(() =>
    useChatStore.persist.hasHydrated(),
  )
  const credentials = useChatStore((state) => state.credentials)
  useNotificationPoll()

  useEffect(() => {
    if (useChatStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    return useChatStore.persist.onFinishHydration(() => {
      setHydrated(true)
    })
  }, [])

  if (!hydrated) {
    return null
  }

  if (!credentials) {
    return <LoginPage />
  }

  return <ChatShell />
}
