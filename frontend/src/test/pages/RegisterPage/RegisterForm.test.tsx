import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RegisterForm } from '../../../pages/RegisterPage/RegisterForm'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

const renderRegisterForm = (onSwitchToLogin = vi.fn()) =>
    render(
        <MemoryRouter>
            <RegisterForm onSwitchToLogin={onSwitchToLogin} />
        </MemoryRouter>
    )

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn())
        vi.stubGlobal('alert', vi.fn())
        localStorage.clear()
        mockNavigate.mockClear()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('renders all form fields', () => {
        renderRegisterForm()
        expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('********')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Acme Steel Ltd')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Glasgow')).toBeInTheDocument()
    })

    it('shows required errors when submitted with empty required fields', async () => {
        renderRegisterForm()
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(screen.getAllByText('Required')).toHaveLength(2) // email, sme_name
            expect(screen.getByText('Password is required')).toBeInTheDocument()
        })
    })

    it('shows a minLength error when password is under 6 characters', async () => {
        renderRegisterForm()

        fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: '123' } })
        fireEvent.change(screen.getByPlaceholderText('Acme Steel Ltd'), { target: { value: 'Sumit Exchange Ltd' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => {
            expect(screen.getByText('Min 6 characters')).toBeInTheDocument()
        })
    })

    it('registers successfully, stores token/user, alerts, and navigates home', async () => {
        const mockResponse = {
            token: 'fake-jwt-token',
            user: { id: 'u1', email: 'a@b.com', sme_name: 'Sumit Exchange Ltd' },
        }
            ; (fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            })

        renderRegisterForm()

        fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText('Acme Steel Ltd'), { target: { value: 'Sumit Exchange Ltd' } })
        fireEvent.change(screen.getByPlaceholderText('Glasgow'), { target: { value: 'London' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))

        expect(localStorage.getItem('token')).toBe('fake-jwt-token')
        expect(JSON.parse(localStorage.getItem('user') || '{}')).toEqual(mockResponse.user)
        expect(window.alert).toHaveBeenCalledWith('Account created! Please login.')
    })

    it('shows an error message when registration fails', async () => {
        ; (fetch as any).mockResolvedValue({
            ok: false,
            json: async () => ({ detail: 'Email already registered' }),
        })

        renderRegisterForm()

        fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText('Acme Steel Ltd'), { target: { value: 'Sumit Exchange Ltd' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => expect(screen.getByText('Email already registered')).toBeInTheDocument())
        expect(mockNavigate).not.toHaveBeenCalled()
        expect(window.alert).not.toHaveBeenCalled()
    })

    it('shows a connection error message when the request throws', async () => {
        ; (fetch as any).mockRejectedValue(new Error('network error'))

        renderRegisterForm()

        fireEvent.change(screen.getByPlaceholderText('you@company.com'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText('********'), { target: { value: 'password123' } })
        fireEvent.change(screen.getByPlaceholderText('Acme Steel Ltd'), { target: { value: 'Sumit Exchange Ltd' } })
        fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

        await waitFor(() => expect(screen.getByText('Connection error')).toBeInTheDocument())
    })

    it('calls onSwitchToLogin when "Login" link is clicked', () => {
        const onSwitchToLogin = vi.fn()
        renderRegisterForm(onSwitchToLogin)

        fireEvent.click(screen.getByText('Login'))
        expect(onSwitchToLogin).toHaveBeenCalledOnce()
    })
})