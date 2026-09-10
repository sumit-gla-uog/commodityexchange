import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginForm } from '../../../pages/LoginPage/LoginForm'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderLoginForm = (onSwitchToRegister = vi.fn()) =>
  render(
    <MemoryRouter>
      <LoginForm onSwitchToRegister={onSwitchToRegister} />
    </MemoryRouter>
  )

describe('LoginForm', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    localStorage.clear()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the email and password fields', () => {
    renderLoginForm()
    expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
  })

  it('shows required errors when submitted with empty fields', async () => {
    renderLoginForm()
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getAllByText('Required')).toHaveLength(2)
    })
  })

  it('logs in successfully and stores token/user, then navigates to dashboard', async () => {
    const mockResponse = {
      token: 'fake-jwt-token',
      user: { id: 'u1', email: 'a@b.com', sme_name: 'Sumit Exchange Ltd' },
    }
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    })

    renderLoginForm()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))

    expect(localStorage.getItem('token')).toBe('fake-jwt-token')
    expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(mockResponse.user)
  })

  it('shows an error message when login fails with invalid credentials', async () => {
    ;(fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Invalid email or password' }),
    })

    renderLoginForm()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'wrongpass' } })
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(screen.getByText('Invalid email or password')).toBeInTheDocument())
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a connection error message when the request throws', async () => {
    ;(fetch as any).mockRejectedValue(new Error('network error'))

    renderLoginForm()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(screen.getByText('Connection error')).toBeInTheDocument())
  })

  it('shows "Signing in..." and disables the button while submitting', async () => {
    let resolveRequest: (value: any) => void
    ;(fetch as any).mockReturnValue(new Promise((resolve) => { resolveRequest = resolve }))

    renderLoginForm()

    fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
    fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByText('Login'))

    await waitFor(() => expect(screen.getByText('Signing in...')).toBeInTheDocument())
    expect(screen.getByText('Signing in...')).toBeDisabled()

    await fireEvent(window, new Event('cleanup')) // no-op, just to let promise settle in next tick if needed
    resolveRequest!({ ok: true, json: async () => ({ token: 't', user: {} }) })
  })

  it('calls onSwitchToRegister when "Register Now" is clicked', () => {
    const onSwitchToRegister = vi.fn()
    renderLoginForm(onSwitchToRegister)

    fireEvent.click(screen.getByText('Register Now'))
    expect(onSwitchToRegister).toHaveBeenCalledOnce()
  })
})