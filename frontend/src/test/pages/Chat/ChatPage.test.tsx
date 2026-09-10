import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatPage } from '../../../pages/Chat/ChatPage'
import * as useChatModule from '../../../hooks/useChat'
import type { ChatMessage } from '../../../types/commodity'

describe('ChatPage', () => {
  const mockSendMessage = vi.fn()

  beforeEach(() => {
    mockSendMessage.mockClear()
    vi.spyOn(useChatModule, 'useChat').mockReturnValue({
      messages: [
        { role: 'assistant', content: 'Welcome to CommodEx!' },
      ] as ChatMessage[],
      loading: false,
      loadingMessage: 'Checking live prices...',
      sendMessage: mockSendMessage,
    })

    // jsdom doesn't implement scrollIntoView
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('renders the page heading', () => {
    render(<ChatPage />)
    expect(screen.getByText('Commodity Intelligence Expert Advice')).toBeInTheDocument()
  })

  it('renders existing messages', () => {
    render(<ChatPage />)
    expect(screen.getByText('Welcome to CommodEx!')).toBeInTheDocument()
  })

  it('renders assistant messages with markdown', () => {
    vi.spyOn(useChatModule, 'useChat').mockReturnValue({
      messages: [{ role: 'assistant', content: '**bold text**' }] as ChatMessage[],
      loading: false,
      loadingMessage: '',
      sendMessage: mockSendMessage,
    })

    render(<ChatPage />)
    const boldElement = screen.getByText('bold text')
    expect(boldElement.tagName).toBe('STRONG')
  })

  it('renders user messages as plain text without markdown', () => {
    vi.spyOn(useChatModule, 'useChat').mockReturnValue({
      messages: [{ role: 'user', content: '**not bold**' }] as ChatMessage[],
      loading: false,
      loadingMessage: '',
      sendMessage: mockSendMessage,
    })

    render(<ChatPage />)
    expect(screen.getByText('**not bold**')).toBeInTheDocument()
  })

  it('shows the loading message when loading is true', () => {
    vi.spyOn(useChatModule, 'useChat').mockReturnValue({
      messages: [],
      loading: true,
      loadingMessage: 'Scanning recent news...',
      sendMessage: mockSendMessage,
    })

    render(<ChatPage />)
    expect(screen.getByText('Scanning recent news...')).toBeInTheDocument()
  })

  it('does not show a loading bubble when loading is false', () => {
    render(<ChatPage />)
    expect(screen.queryByText('Checking live prices...')).not.toBeInTheDocument()
  })

  it('calls sendMessage with the input value and clears the input when Send is clicked', () => {
    render(<ChatPage />)

    const input = screen.getByPlaceholderText('Ask about commodity prices...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'How is copper doing?' } })
    fireEvent.click(screen.getByText('Send'))

    expect(mockSendMessage).toHaveBeenCalledWith('How is copper doing?')
    expect(input.value).toBe('')
  })

  it('calls sendMessage when Enter is pressed in the input', () => {
    render(<ChatPage />)

    const input = screen.getByPlaceholderText('Ask about commodity prices...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Wheat prices?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(mockSendMessage).toHaveBeenCalledWith('Wheat prices?')
  })

  it('does not call sendMessage on other key presses', () => {
    render(<ChatPage />)

    const input = screen.getByPlaceholderText('Ask about commodity prices...')
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.keyDown(input, { key: 'a' })

    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('disables the Send button while loading', () => {
    vi.spyOn(useChatModule, 'useChat').mockReturnValue({
      messages: [],
      loading: true,
      loadingMessage: '',
      sendMessage: mockSendMessage,
    })

    render(<ChatPage />)
    expect(screen.getByText('Send')).toBeDisabled()
  })
})