import { describe, expect, it } from 'vitest'
import {
  chatSubtitle,
  formatPhoneDisplay,
  isValidPhone,
  normalizePhone,
} from './phone'

describe('normalizePhone', () => {
  it('strips non-digits', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567')
  })

  it('converts 8XXXXXXXXXX to 7…', () => {
    expect(normalizePhone('89991234567')).toBe('79991234567')
  })

  it('leaves 7… and 375… unchanged', () => {
    expect(normalizePhone('79991234567')).toBe('79991234567')
    expect(normalizePhone('375291234567')).toBe('375291234567')
  })
})

describe('isValidPhone', () => {
  it('accepts RU 11-digit 7… and BY 12-digit 375…', () => {
    expect(isValidPhone('79991234567')).toBe(true)
    expect(isValidPhone('375291234567')).toBe(true)
  })

  it('rejects wrong length or prefix', () => {
    expect(isValidPhone('89991234567')).toBe(false)
    expect(isValidPhone('7999123456')).toBe(false)
    expect(isValidPhone('37529123456')).toBe(false)
    expect(isValidPhone('12345678901')).toBe(false)
    expect(isValidPhone('')).toBe(false)
  })
})

describe('formatPhoneDisplay', () => {
  it('formats RU numbers', () => {
    expect(formatPhoneDisplay('79991234567')).toBe('+7 999 123-45-67')
  })

  it('formats BY numbers', () => {
    expect(formatPhoneDisplay('375291234567')).toBe('+375 29 123-45-67')
  })

  it('prefixes unknown digits with +', () => {
    expect(formatPhoneDisplay('12345')).toBe('+12345')
  })

  it('returns empty string for empty input', () => {
    expect(formatPhoneDisplay('')).toBe('')
  })
})

describe('chatSubtitle', () => {
  it('prefers phone over chatId', () => {
    expect(
      chatSubtitle({ chatId: 'id', phone: '79991234567', name: 'A' }),
    ).toBe('79991234567')
  })

  it('falls back to chatId when phone is empty', () => {
    expect(chatSubtitle({ chatId: 'chat-1', phone: '', name: 'A' })).toBe(
      'chat-1',
    )
  })
})
