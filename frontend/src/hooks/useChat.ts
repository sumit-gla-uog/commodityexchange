import { useState, useEffect, useCallback } from 'react'
import { BASE_URL } from '../api/client'
import type { ChatMessage } from '../types/commodity'

const LOADING_MESSAGES = [
  'Checking live prices...',
  'Reviewing historical trends...',
  'Scanning recent news...',
  'Preparing your answer...',
]

const getInitialMessages = (): ChatMessage[] => {
  try {
    const saved = sessionStorage.getItem('chat_messages')
    if (saved) return JSON.parse(saved)
  } catch {
    console.warn('Failed to parse saved chat messages, starting fresh')
  }
  return [
    {
      role: 'assistant',
      content: 'Welcome to CommodEx! Ask me anything about commodity prices and procurement decisions.'
    }
  ]
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages)
  const [loading, setLoading] = useState(false)
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)

  useEffect(() => {
    if (!loading) {
      setLoadingMsgIndex(0)
      return
    }
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    sessionStorage.setItem('chat_messages', JSON.stringify(messages))
  }, [messages])

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return

    const userMessage: ChatMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
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
  }, [])

  return {
    messages,
    loading,
    loadingMessage: LOADING_MESSAGES[loadingMsgIndex],
    sendMessage,
  }
}