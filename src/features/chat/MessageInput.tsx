import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { useChatStore } from '@/store/chatStore'
import styles from './MessageInput.module.css'

export function MessageInput() {
  const sendText = useChatStore((state) => state.sendText)
  const isSending = useChatStore((state) => state.isSending)
  const sendError = useChatStore((state) => state.sendError)
  const [text, setText] = useState('')

  const submit = async () => {
    const value = text.trim()
    if (!value || isSending) {
      return
    }
    try {
      await sendText(value)
      setText('')
    } catch {
      /* error shown via store */
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {sendError ? <p className={styles.error}>{sendError}</p> : null}
      <div className={styles.row}>
        <textarea
          className={styles.input}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          rows={1}
          maxLength={4000}
        />
        <button
          type="submit"
          className={styles.send}
          disabled={isSending || !text.trim()}
          aria-label="Отправить"
        >
          →
        </button>
      </div>
    </form>
  )
}
