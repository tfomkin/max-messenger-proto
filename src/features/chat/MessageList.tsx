import { useEffect, useRef } from 'react'
import { useChatStore } from '@/store/chatStore'
import styles from './MessageList.module.css'

type Props = {
  chatId: string
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MessageList({ chatId }: Props) {
  const messages = useChatStore((state) => state.messagesByChatId[chatId] ?? [])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={styles.list}>
      {messages.length === 0 ? (
        <p className={styles.empty}>Напишите первое сообщение</p>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.row} ${
              message.direction === 'out' ? styles.out : styles.in
            }`}
          >
            <div className={styles.bubble}>
              <p className={styles.text}>{message.text}</p>
              <time className={styles.time}>
                {formatTime(message.timestamp)}
              </time>
            </div>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  )
}
