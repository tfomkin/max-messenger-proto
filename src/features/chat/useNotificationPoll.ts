import { useEffect } from 'react'
import {
  startNotificationPolling,
  stopNotificationPolling,
} from '@/features/chat/notificationPoller'
import { useChatStore } from '@/store/chatStore'

export function useNotificationPoll() {
  const credentials = useChatStore((state) => state.credentials)

  useEffect(() => {
    if (!credentials) {
      stopNotificationPolling()
      return
    }

    startNotificationPolling(credentials)

    return () => {
      stopNotificationPolling()
    }
  }, [credentials])
}
