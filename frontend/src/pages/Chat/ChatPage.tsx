import { useState, useRef, useEffect } from 'react'
import { Button, Text } from '@salt-ds/core'
import type { ChatMessage } from '../../types/commodity'
import { BASE_URL } from '../../api/client'
import styles from './ChatPage.module.css'

export const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Welcome to CommodEx! Ask me anything about commodity prices and procurement decisions.'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // const res = await fetch('http://localhost:8000/api/chat/', {
      const res = await fetch(`${BASE_URL}/api/chat/agentic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error fetching response. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Text styleAs="h2" className={`text-white font-bold ${styles.heading}`}>
        Commodity Intelligence Expert Advice
      </Text>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.row} ${msg.role === 'user' ? styles.rowUser : styles.rowAssistant}`}>
            <div className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className={styles.rowAssistant} style={{ display: 'flex' }}>
            <div className={styles.loadingBubble}>Retrieving commodity data...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about commodity prices..."
          className={styles.textInput}
        />
        <Button onClick={sendMessage} className={styles.sendButton} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  )
}