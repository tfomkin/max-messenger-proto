import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { sendMessage as apiSendMessage } from '@/shared/api/green-api'
import type { Chat, ChatMessage, Credentials } from '@/shared/types'

type ChatState = {
  credentials: Credentials | null
  chats: Chat[]
  activeChatId: string | null
  messagesByChatId: Record<string, ChatMessage[]>
  isSending: boolean
  sendError: string | null
  login: (credentials: Credentials) => void
  logout: () => void
  addChat: (chat: Chat) => void
  setActiveChat: (chatId: string | null) => void
  appendMessage: (message: ChatMessage) => void
  ensureChat: (chat: Chat) => void
  sendText: (text: string) => Promise<void>
}

function insertChat(
  chats: Chat[],
  messagesByChatId: Record<string, ChatMessage[]>,
  chat: Chat,
  position: 'prepend' | 'append',
): { chats: Chat[]; messagesByChatId: Record<string, ChatMessage[]> } | null {
  if (chats.some((item) => item.chatId === chat.chatId)) {
    return null
  }
  return {
    chats: position === 'prepend' ? [chat, ...chats] : [...chats, chat],
    messagesByChatId: {
      ...messagesByChatId,
      [chat.chatId]: messagesByChatId[chat.chatId] ?? [],
    },
  }
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      credentials: null,
      chats: [],
      activeChatId: null,
      messagesByChatId: {},
      isSending: false,
      sendError: null,

      login: (credentials) => {
        set({
          credentials: {
            idInstance: credentials.idInstance.trim(),
            apiTokenInstance: credentials.apiTokenInstance.trim(),
            apiUrl: credentials.apiUrl.trim(),
          },
          chats: [],
          activeChatId: null,
          messagesByChatId: {},
          sendError: null,
        })
      },

      logout: () => {
        set({
          credentials: null,
          chats: [],
          activeChatId: null,
          messagesByChatId: {},
          isSending: false,
          sendError: null,
        })
      },

      addChat: (chat) => {
        const { chats, messagesByChatId } = get()
        const inserted = insertChat(chats, messagesByChatId, chat, 'prepend')
        if (!inserted) {
          set({ activeChatId: chat.chatId })
          return
        }
        set({
          ...inserted,
          activeChatId: chat.chatId,
        })
      },

      setActiveChat: (chatId) => set({ activeChatId: chatId, sendError: null }),

      appendMessage: (message) => {
        const list = get().messagesByChatId[message.chatId] ?? []
        if (list.some((item) => item.id === message.id)) {
          return
        }
        set({
          messagesByChatId: {
            ...get().messagesByChatId,
            [message.chatId]: [...list, message],
          },
        })
      },

      ensureChat: (chat) => {
        const { chats, messagesByChatId } = get()
        const inserted = insertChat(chats, messagesByChatId, chat, 'append')
        if (!inserted) {
          return
        }
        set(inserted)
      },

      sendText: async (text) => {
        const trimmed = text.trim()
        const { credentials, activeChatId } = get()
        if (!credentials || !activeChatId || !trimmed) {
          return
        }

        set({ isSending: true, sendError: null })
        try {
          const { idMessage } = await apiSendMessage(
            credentials,
            activeChatId,
            trimmed,
          )
          get().appendMessage({
            id: idMessage,
            chatId: activeChatId,
            text: trimmed,
            direction: 'out',
            timestamp: Math.floor(Date.now() / 1000),
          })
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Не удалось отправить сообщение'
          set({ sendError: message })
          throw error
        } finally {
          set({ isSending: false })
        }
      },
    }),
    {
      name: 'max-messenger-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        credentials: state.credentials,
        chats: state.chats,
        activeChatId: state.activeChatId,
        messagesByChatId: state.messagesByChatId,
      }),
    },
  ),
)
