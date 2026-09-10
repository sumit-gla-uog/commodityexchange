import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button, Text } from '@salt-ds/core'
import { useChat } from '../../hooks/useChat'
import styles from './ChatPage.module.css'

export const ChatPage = () => {
  const { messages, loading, loadingMessage, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    sendMessage(input)
    setInput('')
  }

  return (
    <div className={styles.page}>
      <Text styleAs="h2" className={`text-white font-bold ${styles.heading}`}>
        Commodity Intelligence Expert Advice
      </Text>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowAssistant}`}>
            <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className={styles.rowAssistant} style={{ display: 'flex' }}>
            <div className={styles.loadingBubble}>{loadingMessage}</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about commodity prices..."
          className={styles.textInput}
        />
        <Button onClick={handleSend} className={styles.sendButton} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  )
}