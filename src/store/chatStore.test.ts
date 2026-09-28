import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetChatStore } from '@/test/fixtures'

vi.mock('@/shared/api/green-api', () => ({
  sendMessage: vi.fn(),
}))

import { sendMessage as apiSendMessage } from '@/shared/api/green-api'
import { useChatStore } from './chatStore'

const mockedSendMessage = vi.mocked(apiSendMessage)

const credentials = {
  idInstance: ' 111 ',
  apiTokenInstance: ' token ',
  apiUrl: ' https://api.green-api.com/ ',
}

beforeEach(() => {
  resetChatStore()
  mockedSendMessage.mockReset()
})

afterEach(() => {
  resetChatStore()
})

describe('chatStore', () => {
  it('login trims credentials and clears chats', () => {
    useChatStore.setState({
      chats: [{ chatId: 'old', phone: '1', name: 'Old' }],
      activeChatId: 'old',
      messagesByChatId: {
        old: [
          {
            id: 'm1',
            chatId: 'old',
            text: 'hi',
            direction: 'in',
            timestamp: 1,
          },
        ],
      },
      sendError: 'err',
    })

    useChatStore.getState().login(credentials)

    expect(useChatStore.getState().credentials).toEqual({
      idInstance: '111',
      apiTokenInstance: 'token',
      apiUrl: 'https://api.green-api.com/',
    })
    expect(useChatStore.getState().chats).toEqual([])
    expect(useChatStore.getState().activeChatId).toBeNull()
    expect(useChatStore.getState().messagesByChatId).toEqual({})
    expect(useChatStore.getState().sendError).toBeNull()
  })

  it('logout clears auth and chat state', () => {
    useChatStore.getState().login({
      idInstance: '111',
      apiTokenInstance: 'token',
      apiUrl: 'https://api.green-api.com',
    })
    useChatStore.getState().addChat({
      chatId: 'c1',
      phone: '79991234567',
      name: 'Alice',
    })

    useChatStore.getState().logout()

    expect(useChatStore.getState()).toMatchObject({
      credentials: null,
      chats: [],
      activeChatId: null,
      messagesByChatId: {},
      isSending: false,
      sendError: null,
    })
  })

  it('addChat prepends and sets active; duplicate only switches active', () => {
    const chatA = { chatId: 'a', phone: '1', name: 'A' }
    const chatB = { chatId: 'b', phone: '2', name: 'B' }

    useChatStore.getState().addChat(chatA)
    useChatStore.getState().addChat(chatB)

    expect(useChatStore.getState().chats.map((c) => c.chatId)).toEqual([
      'b',
      'a',
    ])
    expect(useChatStore.getState().activeChatId).toBe('b')

    useChatStore.getState().addChat(chatA)
    expect(useChatStore.getState().chats).toHaveLength(2)
    expect(useChatStore.getState().activeChatId).toBe('a')
  })

  it('appendMessage appends and ignores duplicate ids', () => {
    const message = {
      id: 'm1',
      chatId: 'c1',
      text: 'hello',
      direction: 'out' as const,
      timestamp: 100,
    }

    useChatStore.getState().appendMessage(message)
    useChatStore.getState().appendMessage(message)
    useChatStore.getState().appendMessage({
      ...message,
      id: 'm2',
      text: 'world',
    })

    expect(useChatStore.getState().messagesByChatId.c1).toEqual([
      message,
      { ...message, id: 'm2', text: 'world' },
    ])
  })

  it('ensureChat adds once without changing active chat', () => {
    useChatStore.getState().addChat({
      chatId: 'active',
      phone: '1',
      name: 'Active',
    })
    useChatStore.getState().ensureChat({
      chatId: 'other',
      phone: '2',
      name: 'Other',
    })
    useChatStore.getState().ensureChat({
      chatId: 'other',
      phone: '2',
      name: 'Other again',
    })

    expect(useChatStore.getState().activeChatId).toBe('active')
    expect(useChatStore.getState().chats.map((c) => c.chatId)).toEqual([
      'active',
      'other',
    ])
  })

  it('sendText no-ops without credentials, active chat, or text', async () => {
    await useChatStore.getState().sendText('hello')
    expect(mockedSendMessage).not.toHaveBeenCalled()

    useChatStore.getState().login({
      idInstance: '111',
      apiTokenInstance: 'token',
      apiUrl: 'https://api.green-api.com',
    })
    await useChatStore.getState().sendText('hello')
    expect(mockedSendMessage).not.toHaveBeenCalled()

    useChatStore.getState().addChat({
      chatId: 'c1',
      phone: '1',
      name: 'A',
    })
    await useChatStore.getState().sendText('   ')
    expect(mockedSendMessage).not.toHaveBeenCalled()
  })

  it('sendText appends outgoing message on success', async () => {
    useChatStore.getState().login({
      idInstance: '111',
      apiTokenInstance: 'token',
      apiUrl: 'https://api.green-api.com',
    })
    useChatStore.getState().addChat({
      chatId: 'c1',
      phone: '1',
      name: 'A',
    })
    mockedSendMessage.mockResolvedValue({ idMessage: 'out-1' })

    await useChatStore.getState().sendText('  hi  ')

    expect(mockedSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ idInstance: '111' }),
      'c1',
      'hi',
    )
    expect(useChatStore.getState().messagesByChatId.c1).toEqual([
      expect.objectContaining({
        id: 'out-1',
        chatId: 'c1',
        text: 'hi',
        direction: 'out',
      }),
    ])
    expect(useChatStore.getState().isSending).toBe(false)
    expect(useChatStore.getState().sendError).toBeNull()
  })

  it('sendText sets sendError and rethrows on failure', async () => {
    useChatStore.getState().login({
      idInstance: '111',
      apiTokenInstance: 'token',
      apiUrl: 'https://api.green-api.com',
    })
    useChatStore.getState().addChat({
      chatId: 'c1',
      phone: '1',
      name: 'A',
    })
    mockedSendMessage.mockRejectedValue(new Error('network down'))

    await expect(useChatStore.getState().sendText('hi')).rejects.toThrow(
      'network down',
    )
    expect(useChatStore.getState().sendError).toBe('network down')
    expect(useChatStore.getState().isSending).toBe(false)
    expect(useChatStore.getState().messagesByChatId.c1).toEqual([])
  })
})
