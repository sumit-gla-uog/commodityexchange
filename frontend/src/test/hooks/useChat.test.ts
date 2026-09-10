import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useChat } from '../../hooks/useChat'

describe('useChat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    sessionStorage.clear()
  })

  it('starts with the default welcome message when sessionStorage is empty', () => {
    const { result } = renderHook(() => useChat())

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].role).toBe('assistant')
    expect(result.current.messages[0].content).toContain('Welcome to CommodEx')
  })

  it('restores messages from sessionStorage if present', () => {
    const savedMessages = [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
    ]
    sessionStorage.setItem('chat_messages', JSON.stringify(savedMessages))

    const { result } = renderHook(() => useChat())

    expect(result.current.messages).toEqual(savedMessages)
  })

  it('falls back to the default welcome message if sessionStorage has corrupt JSON', () => {
    sessionStorage.setItem('chat_messages', 'not-valid-json{{{')

    const { result } = renderHook(() => useChat())

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].content).toContain('Welcome to CommodEx')
  })

  it('does nothing when sendMessage is called with an empty/whitespace input', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('   ')
    })

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current.messages).toHaveLength(1) // unchanged
  })

  it('adds the user message immediately and sets loading to true', async () => {
    ;(fetch as any).mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('How is copper doing?')
    })

    expect(result.current.messages).toContainEqual({ role: 'user', content: 'How is copper doing?' })
    expect(result.current.loading).toBe(true)
  })

  it('appends the assistant response and sets loading to false on success', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ answer: 'Copper is trending upward.' }),
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('How is copper doing?')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.messages).toContainEqual({
      role: 'assistant',
      content: 'Copper is trending upward.',
    })
  })

  it('appends an error message and sets loading to false when the request fails', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('How is copper doing?')
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.messages).toContainEqual({
      role: 'assistant',
      content: 'Error fetching response. Please try again.',
    })
  })

  it('persists messages to sessionStorage whenever they change', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ answer: 'Some answer' }),
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('test query')
    })

    const saved = JSON.parse(sessionStorage.getItem('chat_messages') || '[]')
    expect(saved).toContainEqual({ role: 'user', content: 'test query' })
    expect(saved).toContainEqual({ role: 'assistant', content: 'Some answer' })
  })

  it('cycles through loading messages every 2 seconds while loading', async () => {
    ;(fetch as any).mockReturnValue(new Promise(() => {})) // never resolves, stays loading

    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendMessage('test')
    })

    expect(result.current.loadingMessage).toBe('Checking live prices...')

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.loadingMessage).toBe('Reviewing historical trends...')

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.loadingMessage).toBe('Scanning recent news...')
  })

  it('resets loadingMessage index once loading finishes', async () => {
    ;(fetch as any).mockResolvedValue({
      json: async () => ({ answer: 'done' }),
    })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.sendMessage('test')
    })

    expect(result.current.loadingMessage).toBe('Checking live prices...') // reset to index 0
  })
})