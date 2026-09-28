import type { Chat } from '@/shared/types'

type PhoneRule = {
  prefix: string
  length: number
  format: (digits: string) => string
}

const PHONE_RULES: PhoneRule[] = [
  {
    prefix: '7',
    length: 11,
    format: (digits) =>
      `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`,
  },
  {
    prefix: '375',
    length: 12,
    format: (digits) =>
      `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`,
  },
]

function findRule(digits: string): PhoneRule | undefined {
  return PHONE_RULES.find(
    (rule) => digits.startsWith(rule.prefix) && digits.length === rule.length,
  )
}

/** Normalize phone input to digits only (international format without +). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.startsWith('8') && digits.length === 11) {
    return `7${digits.slice(1)}`
  }
  return digits
}

export function isValidPhone(digits: string): boolean {
  return findRule(digits) !== undefined
}

export function formatPhoneDisplay(digits: string): string {
  const rule = findRule(digits)
  if (rule) {
    return rule.format(digits)
  }
  return digits ? `+${digits}` : ''
}

export function chatSubtitle(chat: Chat): string {
  return chat.phone || chat.chatId
}
