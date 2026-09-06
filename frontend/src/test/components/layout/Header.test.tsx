import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
// import { Header } from '../../components/layout/Header'
import { Header } from '../../../components/layout/Header';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('renders the given title', () => {
    render(<Header title="Barter Matching Engine" />)
    expect(screen.getByText('Barter Matching Engine')).toBeInTheDocument()
  })

  it('displays the logged-in user sme_name from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ sme_name: 'Sumit Exchange Ltd' }))
    render(<Header title="Dashboard" />)
    expect(screen.getByText('Sumit Exchange Ltd')).toBeInTheDocument()
  })

  it('renders without crashing when localStorage has no user', () => {
    render(<Header title="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('clears token, user, and redirects on logout click', () => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ sme_name: 'Sumit Exchange Ltd' }))

    // window.location.href is not settable directly in jsdom without this workaround
    delete (window as any).location
    window.location = { href: '' } as any

    render(<Header title="Dashboard" />)
    fireEvent.click(screen.getByText('Logout'))

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(window.location.href).toBe('/')
  })
})