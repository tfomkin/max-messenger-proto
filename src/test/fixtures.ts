import { useChatStore } from '@/store/chatStore'
import type { Credentials } from '@/shared/types'

export const testCredentials: Credentials = {
  idInstance: '111',
  apiTokenInstance: 'token',
  apiUrl: 'https://api.green-api.com',
}

export function resetChatStore() {
  useChatStore.getState().logout()
  localStorage.clear()
  useChatStore.setState({
    credentials: null,
    chats: [],
    activeChatId: null,
    messagesByChatId: {},
    isSending: false,
    sendError: null,
  })
}
