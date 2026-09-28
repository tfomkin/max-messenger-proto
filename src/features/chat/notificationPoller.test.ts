import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetChatStore, testCredentials } from '@/test/fixtures'

vi.mock('@/shared/api/green-api', () => ({
  receiveNotification: vi.fn(),
  deleteNotification: vi.fn(),
}))

import { deleteNotification, receiveNotification } from '@/shared/api/green-api'
import { useChatStore } from '@/store/chatStore'
import {
  startNotificationPolling,
  stopNotificationPolling,
} from './notificationPoller'

const mockedReceive = vi.mocked(receiveNotification)
const mockedDelete = vi.mocked(deleteNotification)

const textNotification = {
  receiptId: 10,
  body: {
    typeWebhook: 'incomingMessageReceived',
    timestamp: 1_700_000_000,
    idMessage: 'in-1',
    senderData: {
      chatId: 'chat-1',
      senderName: 'Bob',
      senderPhoneNumber: 79991234567,
    },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: { textMessage: 'hello from max' },
    },
  },
}

beforeEach(() => {
  vi.useFakeTimers()
  mockedReceive.mockReset()
  mockedDelete.mockReset()
  mockedDelete.mockResolvedValue({ result: true })
  resetChatStore()
  useChatStore.getState().login(testCredentials)
})

afterEach(() => {
  stopNotificationPolling()
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('notificationPoller', () => {
  it('handles text incoming messages and deletes notification', async () => {
    mockedReceive
      .mockResolvedValueOnce(textNotification)
      .mockImplementation(() => new Promise(() => {}))

    startNotificationPolling(testCredentials)
    await vi.advanceTimersByTimeAsync(0)

    expect(useChatStore.getState().chats).toEqual([
      expect.objectContaining({
        chatId: 'chat-1',
        phone: '79991234567',
        name: 'Bob',
      }),
    ])
    expect(useChatStore.getState().messagesByChatId['chat-1']).toEqual([
      {
        id: 'in-1',
        chatId: 'chat-1',
        text: 'hello from max',
        direction: 'in',
        timestamp: 1_700_000_000,
      },
    ])
    expect(mockedDelete).toHaveBeenCalledWith(
      testCredentials,
      10,
      expect.any(AbortSignal),
    )
  })

  it('deletes non-text webhooks without appending messages', async () => {
    mockedReceive
      .mockResolvedValueOnce({
        receiptId: 11,
        body: {
          typeWebhook: 'outgoingMessageReceived',
          timestamp: 1,
          idMessage: 'x',
          senderData: { chatId: 'chat-1' },
          messageData: { typeMessage: 'imageMessage' },
        },
      })
      .mockImplementation(() => new Promise(() => {}))

    startNotificationPolling(testCredentials)
    await vi.advanceTimersByTimeAsync(0)

    expect(useChatStore.getState().chats).toEqual([])
    expect(useChatStore.getState().messagesByChatId).toEqual({})
    expect(mockedDelete).toHaveBeenCalledWith(
      testCredentials,
      11,
      expect.any(AbortSignal),
    )
  })

  it('waits POLL_BACKOFF_MS after empty receive before next poll', async () => {
    mockedReceive
      .mockResolvedValueOnce(null)
      .mockImplementation(() => new Promise(() => {}))

    startNotificationPolling(testCredentials)
    await vi.advanceTimersByTimeAsync(0)
    expect(mockedReceive).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(4_999)
    expect(mockedReceive).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1)
    expect(mockedReceive).toHaveBeenCalledTimes(2)
  })

  it('stopNotificationPolling aborts the loop', async () => {
    let resolveReceive: ((value: null) => void) | undefined
    mockedReceive.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveReceive = resolve
        }),
    )

    startNotificationPolling(testCredentials)
    await vi.advanceTimersByTimeAsync(0)
    expect(mockedReceive).toHaveBeenCalledTimes(1)

    stopNotificationPolling()
    resolveReceive?.(null)
    await vi.advanceTimersByTimeAsync(10_000)

    expect(mockedReceive).toHaveBeenCalledTimes(1)
  })
})
