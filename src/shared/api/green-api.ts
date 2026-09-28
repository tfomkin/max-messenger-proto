import type {
  CheckAccountResponse,
  Credentials,
  DeleteNotificationResponse,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '@/shared/types'

function buildUrl(
  credentials: Credentials,
  method: string,
  suffix = '',
): string {
  const base = credentials.apiUrl.replace(/\/$/, '')
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = (await response.text()).trim()
  if (!response.ok) {
    let detail = text
    try {
      const json = JSON.parse(text) as { message?: string }
      detail = json.message ?? text
    } catch {
      /* keep raw text */
    }
    throw new Error(detail || `HTTP ${response.status}`)
  }
  if (!text || text === 'null') {
    return null as T
  }
  return JSON.parse(text) as T
}

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, init)
  return parseJson<T>(response)
}

function postJson<T>(
  credentials: Credentials,
  method: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  return request<T>(buildUrl(credentials, method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
}

export function checkAccount(
  credentials: Credentials,
  phoneNumber: number,
  signal?: AbortSignal,
): Promise<CheckAccountResponse> {
  return postJson(credentials, 'checkAccount', { phoneNumber }, signal)
}

export function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
  signal?: AbortSignal,
): Promise<SendMessageResponse> {
  return postJson(credentials, 'sendMessage', { chatId, message }, signal)
}

export function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 20,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse> {
  const url = `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${receiveTimeout}`
  return request(url, { method: 'GET', signal })
}

export function deleteNotification(
  credentials: Credentials,
  receiptId: number,
  signal?: AbortSignal,
): Promise<DeleteNotificationResponse> {
  return request(buildUrl(credentials, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
    signal,
  })
}
