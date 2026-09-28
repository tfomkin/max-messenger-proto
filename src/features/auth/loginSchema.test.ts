import { describe, expect, it } from 'vitest'
import { loginSchema } from './loginSchema'

describe('loginSchema', () => {
  const valid = {
    idInstance: '1234567890',
    apiTokenInstance: 'token-abc',
    apiUrl: 'https://api.green-api.com',
  }

  it('accepts valid values and trims whitespace', async () => {
    const result = await loginSchema.validate({
      idInstance: '  1234567890  ',
      apiTokenInstance: '  token-abc  ',
      apiUrl: '  https://api.green-api.com  ',
    })
    expect(result).toEqual(valid)
  })

  it('requires idInstance', async () => {
    await expect(
      loginSchema.validate({ ...valid, idInstance: '' }),
    ).rejects.toThrow('Введите idInstance')
  })

  it('requires apiTokenInstance', async () => {
    await expect(
      loginSchema.validate({ ...valid, apiTokenInstance: '' }),
    ).rejects.toThrow('Введите apiTokenInstance')
  })

  it('requires apiUrl', async () => {
    await expect(
      loginSchema.validate({ ...valid, apiUrl: '' }),
    ).rejects.toThrow('Введите apiUrl')
  })

  it('rejects non-digit idInstance', async () => {
    await expect(
      loginSchema.validate({ ...valid, idInstance: 'abc123' }),
    ).rejects.toThrow('idInstance должен содержать только цифры')
  })

  it('rejects invalid apiUrl', async () => {
    await expect(
      loginSchema.validate({ ...valid, apiUrl: 'not-a-url' }),
    ).rejects.toThrow('Введите корректный URL')
  })
})
