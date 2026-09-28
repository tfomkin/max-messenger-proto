import { useState } from 'react'
import { chatSubtitle } from '@/shared/lib/phone'
import { useChatStore } from '@/store/chatStore'
import { ChatList } from './ChatList'
import { CreateChatModal } from './CreateChatModal'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'
import styles from './ChatShell.module.css'

export function ChatShell() {
  const logout = useChatStore((state) => state.logout)
  const chats = useChatStore((state) => state.chats)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const setActiveChat = useChatStore((state) => state.setActiveChat)
  const [createOpen, setCreateOpen] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const activeChat = chats.find((chat) => chat.chatId === activeChatId) ?? null

  const openChat = (chatId: string) => {
    setActiveChat(chatId)
    setMobileShowChat(true)
  }

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${mobileShowChat ? styles.sidebarHidden : ''}`}
      >
        <header className={styles.sidebarHeader}>
          <div>
            <p className={styles.appName}>MAX</p>
            <p className={styles.sidebarHint}>Чаты</p>
          </div>
          <button type="button" className={styles.ghostBtn} onClick={logout}>
            Выйти
          </button>
        </header>

        <button
          type="button"
          className={styles.newChatBtn}
          onClick={() => setCreateOpen(true)}
        >
          Новый чат
        </button>

        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={openChat}
        />
      </aside>

      <main
        className={`${styles.main} ${mobileShowChat ? styles.mainVisible : ''}`}
      >
        {activeChat ? (
          <>
            <header className={styles.chatHeader}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setMobileShowChat(false)}
                aria-label="Назад к списку"
              >
                ←
              </button>
              <div>
                <p className={styles.chatTitle}>{activeChat.name}</p>
                <p className={styles.chatSubtitle}>
                  {chatSubtitle(activeChat)}
                </p>
              </div>
            </header>
            <MessageList chatId={activeChat.chatId} />
            <MessageInput />
          </>
        ) : (
          <div className={styles.empty}>
            <p>Выберите чат или создайте новый</p>
            <button
              type="button"
              className={styles.newChatBtn}
              onClick={() => setCreateOpen(true)}
            >
              Новый чат
            </button>
          </div>
        )}
      </main>

      {createOpen ? (
        <CreateChatModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => setMobileShowChat(true)}
        />
      ) : null}
    </div>
  )
}
