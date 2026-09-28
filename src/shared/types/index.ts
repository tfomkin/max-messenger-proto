export type Credentials = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type Chat = {
  chatId: string
  phone: string
  name: string
}

export type MessageDirection = 'in' | 'out'

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  direction: MessageDirection
  timestamp: number
}

export type CheckAccountResponse = {
  exist: boolean
  chatId?: string
  fromCache?: boolean
}

export type SendMessageResponse = {
  idMessage: string
}

export type DeleteNotificationResponse = {
  result: boolean
  reason?: string
}

export type IncomingWebhookBody = {
  typeWebhook: string
  timestamp: number
  idMessage: string
  senderData: {
    chatId: string
    chatName?: string
    sender?: string
    senderName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage: string
    textMessageData?: {
      textMessage: string
    }
  }
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: IncomingWebhookBody
} | null
