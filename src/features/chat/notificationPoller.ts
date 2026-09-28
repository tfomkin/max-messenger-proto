import {
  deleteNotification,
  receiveNotification,
} from '@/shared/api/green-api'
import { formatPhoneDisplay } from '@/shared/lib/phone'
import type { Credentials, IncomingWebhookBody } from '@/shared/types'
import { useChatStore } from '@/store/chatStore'

/** Gap after an empty response or poll error (API may ignore long-poll). */
const POLL_BACKOFF_MS = 5_000
const RECEIVE_TIMEOUT_SEC = 20

let activeController: AbortController | null = null
let loopId = 0

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function handleIncoming(body: IncomingWebhookBody) {
  if (
    body.typeWebhook !== 'incomingMessageReceived' ||
    body.messageData?.typeMessage !== 'textMessage' ||
    !body.messageData.textMessageData?.textMessage
  ) {
    return
  }

  const { appendMessage, ensureChat } = useChatStore.getState()
  const chatId = body.senderData.chatId
  const phone = body.senderData.senderPhoneNumber
    ? String(body.senderData.senderPhoneNumber)
    : ''

  ensureChat({
    chatId,
    phone,
    name:
      body.senderData.senderName ||
      body.senderData.chatName ||
      (phone ? formatPhoneDisplay(phone) : chatId),
  })

  appendMessage({
    id: body.idMessage,
    chatId,
    text: body.messageData.textMessageData.textMessage,
    direction: 'in',
    timestamp: body.timestamp,
  })
}

async function runLoop(
  credentials: Credentials,
  signal: AbortSignal,
  id: number,
): Promise<void> {
  while (!signal.aborted && id === loopId) {
    try {
      const notification = await receiveNotification(
        credentials,
        RECEIVE_TIMEOUT_SEC,
        signal,
      )

      if (signal.aborted || id !== loopId) {
        break
      }

      if (!notification?.receiptId || !notification.body) {
        await sleep(POLL_BACKOFF_MS, signal)
        continue
      }

      handleIncoming(notification.body)

      try {
        await deleteNotification(credentials, notification.receiptId, signal)
      } catch {
        /* already deleted or gone */
      }
    } catch (error) {
      if (signal.aborted || isAbortError(error) || id !== loopId) {
        break
      }
      try {
        await sleep(POLL_BACKOFF_MS, signal)
      } catch {
        break
      }
    }
  }
}

export function startNotificationPolling(credentials: Credentials): void {
  stopNotificationPolling()

  const controller = new AbortController()
  activeController = controller
  const id = ++loopId

  void runLoop(credentials, controller.signal, id)
}

export function stopNotificationPolling(): void {
  loopId += 1
  activeController?.abort()
  activeController = null
}
