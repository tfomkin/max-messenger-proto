import { chatSubtitle } from '@/shared/lib/phone'
import type { Chat } from '@/shared/types'
import styles from './ChatList.module.css'

type Props = {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
}

export function ChatList({ chats, activeChatId, onSelect }: Props) {
  if (chats.length === 0) {
    return (
      <p className={styles.empty}>Пока нет чатов. Создайте первый диалог.</p>
    )
  }

  return (
    <ul className={styles.list}>
      {chats.map((chat) => {
        const active = chat.chatId === activeChatId
        return (
          <li key={chat.chatId}>
            <button
              type="button"
              className={`${styles.item} ${active ? styles.active : ''}`}
              onClick={() => onSelect(chat.chatId)}
            >
              <span className={styles.avatar} aria-hidden>
                {chat.name.slice(0, 1).toUpperCase()}
              </span>
              <span className={styles.meta}>
                <span className={styles.name}>{chat.name}</span>
                <span className={styles.phone}>{chatSubtitle(chat)}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
