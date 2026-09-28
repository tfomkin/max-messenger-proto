import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  checkAccount,
  deleteNotification,
  receiveNotification,
  sendMessage,
} from './green-api'
import type { Credentials } from '@/shared/types'

const credentials: Credentials = {
  idInstance: '111',
  apiTokenInstance: 'secret',
  apiUrl: 'https://api.green-api.com/',
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const text =
    body === null || body === undefined
      ? 'null'
      : typeof body === 'string'
        ? body
        : JSON.stringify(body)
  return new Response(text, {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('green-api', () => {
  it('checkAccount posts to stripped base URL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ exist: true, chatId: '7999@c.us' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await checkAccount(credentials, 79991234567)

    expect(result).toEqual({ exist: true, chatId: '7999@c.us' })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance111/checkAccount/secret',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ phoneNumber: 79991234567 }),
      }),
    )
  })

  it('sendMessage posts chatId and message', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ idMessage: 'msg-1' }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendMessage(credentials, 'chat-1', 'hello')

    expect(result).toEqual({ idMessage: 'msg-1' })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance111/sendMessage/secret',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ chatId: 'chat-1', message: 'hello' }),
      }),
    )
  })

  it('receiveNotification appends receiveTimeout query', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null))
    vi.stubGlobal('fetch', fetchMock)

    const result = await receiveNotification(credentials, 20)

    expect(result).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance111/receiveNotification/secret?receiveTimeout=20',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('receiveNotification returns null for empty body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(receiveNotification(credentials)).resolves.toBeNull()
  })

  it('deleteNotification uses receipt id suffix', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ result: true }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await deleteNotification(credentials, 42)

    expect(result).toEqual({ result: true })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance111/deleteNotification/secret/42',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('throws with JSON message on non-OK response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ message: 'Unauthorized' }, { status: 401 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await expect(checkAccount(credentials, 1)).rejects.toThrow('Unauthorized')
  })

  it('throws with raw text when error body is not JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('gateway timeout', { status: 504 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(checkAccount(credentials, 1)).rejects.toThrow(
      'gateway timeout',
    )
  })

  it('throws HTTP status when error body is empty', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(checkAccount(credentials, 1)).rejects.toThrow('HTTP 500')
  })
})
