import { useState, type FormEvent } from 'react'
import { checkAccount } from '@/shared/api/green-api'
import {
  formatPhoneDisplay,
  isValidPhone,
  normalizePhone,
} from '@/shared/lib/phone'
import formStyles from '@/shared/ui/form.module.css'
import { useChatStore } from '@/store/chatStore'
import styles from './CreateChatModal.module.css'

type Props = {
  onClose: () => void
  onCreated: () => void
}

export function CreateChatModal({ onClose, onCreated }: Props) {
  const credentials = useChatStore((state) => state.credentials)
  const addChat = useChatStore((state) => state.addChat)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!credentials) {
      return
    }

    const digits = normalizePhone(phone)
    if (!isValidPhone(digits)) {
      setError('Укажите номер РФ (+7) или РБ (+375) в международном формате')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await checkAccount(credentials, Number(digits))
      if (!result.exist || !result.chatId) {
        setError('Аккаунт MAX на этом номере не найден')
        return
      }

      addChat({
        chatId: result.chatId,
        phone: digits,
        name: formatPhoneDisplay(digits),
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось создать чат',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <form
        className={styles.modal}
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>Новый чат</h2>
        <p className={styles.hint}>
          Введите номер телефона получателя (РФ или РБ)
        </p>

        <label className={formStyles.field}>
          <span>Телефон</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+7 999 123-45-67"
            autoFocus
            inputMode="tel"
          />
        </label>

        {error ? <p className={formStyles.error}>{error}</p> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Проверка…' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  )
}
